/* eslint-disable no-console */
const syncProtocol = require('y-protocols/dist/sync.cjs')
const awarenessProtocol = require('y-protocols/dist/awareness.cjs')
const encoding = require('lib0/encoding')
const decoding = require('lib0/decoding')
const Y = require('yjs')
const { CollaborativeDoc } = require('@pubsweet/models')

const { db } = require('@coko/server')

let persistence = null

const messageSync = 0
const messageAwareness = 1
const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const docs = new Map()

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
const updateHandler = (update, origin, doc) => {
  console.log(update, doc)
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 * @param {Uint8Array} m
 */
const send = (doc, conn, m) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    closeConn(doc, conn)
  }

  try {
    conn.send(
      m,
      /** @param {any} err */ err => {
        err != null && closeConn(doc, conn)
      },
    )
  } catch (e) {
    closeConn(doc, conn)
  }
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 */
const closeConn = (doc, conn) => {
  if (doc.conns.has(conn)) {
    /**
     * @type {Set<number>}
     */
    // @ts-ignore
    const controlledIds = doc.conns.get(conn)
    doc.conns.delete(conn)
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null,
    )

    if (doc.conns.size === 0 && persistence !== null) {
      // if persisted, we store state and destroy ydocument
      persistence.writeState(doc).then(() => {
        doc.destroy()
      })
      docs.delete(doc.name)
    }
  }

  conn.close()
}

persistence = {
  bindState: async (id, doc) => {
    const docInstance = await CollaborativeDoc.query().findOne({ id })

    if (docInstance && docInstance.docsYDocState) {
      Y.applyUpdate(doc, docInstance.docsYDocState)
    }
  },
  writeState: async ydoc => {
    const id = ydoc.name
    const state = Y.encodeStateAsUpdate(ydoc)
    const delta = ydoc.getText('prosemirror').toDelta()
    const timestamp = db.fn.now()

    const docYjs = await CollaborativeDoc.query().findOne({ id })

    if (delta && delta.length > 0) {
      if (!docYjs) {
        try {
          await CollaborativeDoc.query().insert({
            docs_prosemirror_delta: delta,
            docs_y_doc_state: state,
          })
        } catch (e) {
          console.log(`Insert Query`)
          console.log(e)
        }
      } else {
        try {
          await CollaborativeDoc.query()
            .patch({
              docs_prosemirror_delta: delta,
              docs_y_doc_state: state,
              updated: timestamp,
            })
            .findOne({ id })
        } catch (e) {
          console.log(`Patch Query`)
          console.log(e)
        }
      }
    }
  },
}

module.exports = {
  syncProtocol,
  awarenessProtocol,
  encoding,
  persistence,
  messageSync,
  wsReadyStateConnecting,
  wsReadyStateOpen,
  docs,
  updateHandler,
  decoding,
  send,
  closeConn,
  messageAwareness,
}
