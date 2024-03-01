/* eslint-disable no-param-reassign */
const { logger, verifyJWT } = require('@coko/server')
const { omit } = require('lodash')
const map = require('lib0/map')
const Y = require('yjs')
const { WebSocketServer } = require('ws')
const { CollaborativeDoc } = require('@pubsweet/models')
const config = require('config')

const WSSharedDoc = require('./wsSharedDoc')
const utils = require('./utils')

const pingTimeout = 30000

const messageListener = (conn, doc, message) => {
  try {
    const encoder = utils.encoding.createEncoder()
    const decoder = utils.decoding.createDecoder(message)
    const messageType = utils.decoding.readVarUint(decoder)

    // eslint-disable-next-line default-case
    switch (messageType) {
      case utils.messageSync:
        utils.encoding.writeVarUint(encoder, utils.messageSync)
        utils.syncProtocol.readSyncMessage(decoder, encoder, doc, null)

        if (utils.encoding.length(encoder) > 1) {
          utils.send(doc, conn, utils.encoding.toUint8Array(encoder))
        }

        break
      case utils.messageAwareness:
        utils.awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          utils.decoding.readVarUint8Array(decoder),
          conn,
        )
        break
    }
  } catch (error) {
    console.error(error)
    doc.emit('error', [error])
  }
}

module.exports = () => {
  try {
    const WSServer = new WebSocketServer({
      port: config.get('pubsweet-server.wsYjsServerPort'),
      clientTracking: true,
    })

    // eslint-disable-next-line consistent-return
    WSServer.on('connection', async (injectedWS, request) => {
      injectedWS.binaryType = 'arraybuffer'
      const [id, params] = request.url.slice('1').split('?')

      const variables = {}
      params.split('&').forEach(pair => {
        const [key, value] = pair.split('=')
        variables[key] = value || ''
      })

      let userId = null

      try {
        userId = await new Promise((resolve, reject) => {
          verifyJWT(variables.token, (_, usr) => {
            if (usr) {
              resolve(usr)
            } else {
              reject()
            }
          })
        })
      } catch (e) {
        logger.error('failed to Connect')
        userId = null
      }

      const doc = getYDoc(id, userId)

      if (userId) {
        const docObject = await CollaborativeDoc.query().findOne({ id })

        if (!docObject) {
          const state = Y.encodeStateAsUpdate(doc)
          const delta = doc.getText('prosemirror').toDelta()

          await CollaborativeDoc.query()
            .insert({
              docs_prosemirror_delta: delta,
              docs_y_doc_state: state,
              groupId: variables.groupId,
              ...omit(variables, ['token']),
            })
            .returning('*')
        }
      }

      doc.conns.set(injectedWS, new Set())

      injectedWS.on('message', message =>
        messageListener(injectedWS, doc, new Uint8Array(message)),
      )

      let pingReceived = true

      const pingInterval = setInterval(() => {
        if (!pingReceived) {
          if (doc.conns.has(injectedWS)) {
            utils.closeConn(doc, injectedWS)
          }

          clearInterval(pingInterval)
        } else if (doc.conns.has(injectedWS)) {
          pingReceived = false

          try {
            injectedWS.ping()
          } catch (error) {
            utils.closeConn(doc, injectedWS)
            clearInterval(pingInterval)
          }
        }
      }, pingTimeout)

      injectedWS.on('close', () => {
        utils.closeConn(doc, injectedWS)
        clearInterval(pingInterval)
      })

      injectedWS.on('ping', () => {
        pingReceived = true
      })

      {
        const encoder = utils.encoding.createEncoder()
        utils.encoding.writeVarUint(encoder, utils.messageSync)
        utils.syncProtocol.writeSyncStep1(encoder, doc)
        utils.send(doc, injectedWS, utils.encoding.toUint8Array(encoder))
        const awarenessStates = doc.awareness.getStates()

        if (awarenessStates.size > 0) {
          const encoder1 = utils.encoding.createEncoder()
          utils.encoding.writeVarUint(encoder1, utils.messageAwareness)
          utils.encoding.writeVarUint8Array(
            encoder1,
            utils.awarenessProtocol.encodeAwarenessUpdate(
              doc.awareness,
              Array.from(awarenessStates.keys()),
            ),
          )
          utils.send(doc, injectedWS, utils.encoding.toUint8Array(encoder1))
        }
      }
    })

    const getYDoc = (docName, userId) =>
      map.setIfUndefined(utils.docs, docName, () => {
        const doc = new WSSharedDoc(docName, userId)
        doc.gc = true

        if (utils.persistence !== null) {
          utils.persistence.bindState(docName, doc)
        }

        utils.docs.set(docName, doc)
        return doc
      })
  } catch (error) {
    throw new Error(error)
  }
}
