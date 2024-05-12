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

const extractParamsFromIdentifier = id => {
  const lastIndex = id.lastIndexOf('-')

  // Split the input string at the last occurrence of '-' character
  const objectId = id.slice(0, lastIndex)
  const name = id.slice(lastIndex + 1)
  return { objectId, name }
}

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
const updateHandler = (update, origin, doc) => {
  // console.log(update, origin, doc)
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  // console.log({ message })
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
    const collaborativeForm = await CollaborativeDoc.query().findOne({
      objectId: id,
    })

    if (collaborativeForm) {
      const { yDocState } = collaborativeForm
      Y.applyUpdate(doc, yDocState)
    }
  },
  writeState: async ydoc => {
    const objectId = ydoc.name
    const state = Y.encodeStateAsUpdate(ydoc)

    const timestamp = db.fn.now()

    const docYjs = await CollaborativeDoc.query().findOne({ objectId })

    if (!docYjs) {
      try {
        await CollaborativeDoc.query().insert({
          yDocState: state,
          ...ydoc.extraData,
        })
      } catch (e) {
        console.log(`Insert Query`)
        console.log(e)
      }
    } else {
      try {
        await CollaborativeDoc.query()
          .patch({
            yDocState: state,
            updated: timestamp,
          })
          .findOne({ objectId })
      } catch (e) {
        console.log(`Patch Query`)
        console.log(e)
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
  extractParamsFromIdentifier,
}
