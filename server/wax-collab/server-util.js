const Y = require('yjs')
const syncProtocol = require('y-protocols/dist/sync.cjs')
const awarenessProtocol = require('y-protocols/dist/awareness.cjs')

const encoding = require('lib0/dist/encoding.cjs')
const decoding = require('lib0/dist/decoding.cjs')
const mutex = require('lib0/dist/mutex.cjs')
const map = require('lib0/dist/map.cjs')
const url = require('lib0/dist/url.cjs')
const time = require('lib0/dist/time.cjs')

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

const _ = require('lodash')

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0'
const persistenceDir = process.env.YPERSISTENCE
/**
 * @type {{bindState: function(string,WSSharedDoc):void, writeState:function(string,WSSharedDoc):Promise<any>}|null}
 */
let persistence = null
if (typeof persistenceDir === 'string') {
  // @ts-ignore
  const { LevelDbPersistence } = require('y-leveldb')
  persistence = new LevelDbPersistence(persistenceDir)
}

/**
 * @param {{bindState: function(string,WSSharedDoc):void,
 * writeState:function(string,WSSharedDoc):Promise<any>}|null} persistence_
 */
exports.setPersistence = persistence_ => {
  persistence = persistence_
}

/**
 * @type {Map<string,WSSharedDoc>}
 */
const docs = new Map()

const messageSync = 0
const messageAwareness = 1
const messageAuth = 2

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
const updateHandler = (update, origin, doc) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

class WSSharedDoc extends Y.Doc {
  /**
   * @param {string} name
   */
  constructor(name) {
    super({ gc: gcEnabled })
    this.name = name
    this.mux = mutex.createMutex()
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<Object, Set<number>>}
     */
    this.conns = new Map()
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)
    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = ({ added, updated, removed }, conn) => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs = /** @type {Set<number>} */ (this.conns.get(
          conn,
        ))
        if (connControlledIDs !== undefined) {
          added.forEach(clientID => {
            connControlledIDs.add(clientID)
          })
          removed.forEach(clientID => {
            connControlledIDs.delete(clientID)
          })
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients),
      )
      const buff = encoding.toUint8Array(encoder)
      this.conns.forEach((_, c) => {
        send(this, c, buff)
      })
    }
    this.awareness.on('change', awarenessChangeHandler)
    this.on('update', updateHandler)
  }
}

/**
 * @param {any} conn
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
const messageListener = (conn, doc, message) => {
  const encoder = encoding.createEncoder()
  const decoder = decoding.createDecoder(message)
  const messageType = decoding.readVarUint(decoder)
  switch (messageType) {
    case messageSync:
      console.log('SYNCING NOW')
      console.log('AWARENESS ON SYNC', doc.awareness)
      encoding.writeVarUint(encoder, messageSync)
      syncProtocol.readSyncMessage(decoder, encoder, doc, null)
      if (encoding.length(encoder) > 1) {
        send(doc, conn, encoding.toUint8Array(encoder))
      }
      break
    case messageAwareness: {
      console.log('I HAVE RECEIVED AWARENESS MESSAGE')
      awarenessProtocol.applyAwarenessUpdate(
        doc.awareness,
        decoding.readVarUint8Array(decoder),
        conn,
      )
      break
    }
    case messageAuth: {
      // awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn)

      break
    }
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
      persistence.writeState(doc.name, doc).then(() => {
        doc.destroy()
      })
      docs.delete(doc.name)
    }
  }
  conn.close()
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

const pingTimeout = 30000

async function getUserFromToken(token) {
  const { User } = require('@pubsweet/models')
  const { token: tokenHelper } = require('pubsweet-server/src/authentication')
  const userId = await new Promise((resolve, reject) => {
    tokenHelper.verify(token, (_, id) => {
      if (!id) {
        reject(new Error('Bad auth token'))
      }

      resolve(id)
    })
  })

  const user = await User.find(userId)
  return user
}

const colors = require('./colors')
/**
 * @param {any} conn
 * @param {any} req
 * @param {any} opts
 */
exports.setupWSConnection = async (
  conn,
  req,
  { docName = req.url.slice(1).split('?')[0], gc = true } = {},
) => {
  conn.binaryType = 'arraybuffer'

  const { token } = url.decodeQueryParams(req.url) + 'false'

  // For the purpose of this demo, let's also allow unauthenticated users
  let user
  try {
    user = await getUserFromToken(token)
  } catch (e) {
    console.log('Assigning random username to client')
    const names = require('./names')
    user = { username: _.sample(names) }
  }

  console.log(user)
  // console.log(conn)
  const connectingClientId = Number(url.decodeQueryParams(req.url).id) // to get the client id and set its stuff

  // get doc, create if it does not exist yet
  const doc = map.setIfUndefined(docs, docName, () => {
    const doc = new WSSharedDoc(docName)
    doc.gc = gc
    if (persistence !== null) {
      persistence.bindState(docName, doc)
    }
    docs.set(docName, doc)
    console.log(doc.awareness)
    return doc
  })
  doc.conns.set(conn, new Set())
  // listen and reply to events
  conn.on(
    'message',
    /** @param {ArrayBuffer} message */ message =>
      messageListener(conn, doc, new Uint8Array(message)),
  )
  conn.on('close', () => {
    closeConn(doc, conn)
  })
  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn)
      }
      clearInterval(pingInterval)
    } else if (doc.conns.has(conn)) {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        closeConn(doc, conn)
      }
    }
  }, pingTimeout)
  conn.on('pong', () => {
    pongReceived = true
  })

  // send own awarness/user info
  // Set/initialize the clock for the user too
  // console.log(doc.awareness.getStates)
  const currLocalMeta = doc.awareness.meta.get(connectingClientId)
  const clock = currLocalMeta === undefined ? 10 : currLocalMeta.clock + 1
  console.log(
    'Setting state',
    user.username,
    'for',
    connectingClientId,
    currLocalMeta,
  )
  doc.awareness.getStates().set(connectingClientId, {
    user: { name: user.username, color: _.sample(colors) },
  })
  doc.awareness.meta.set(connectingClientId, {
    clock,
    lastUpdated: time.getUnixTime(),
  })

  // end of own user info

  // const encoder = encoding.createEncoder()
  // encoding.writeVarUint(encoder, messageAuth)
  // encoding.writeVarUint8Array(encoder,
  // syncProtocol.writeSyncStep1(encoder, { username: 'test', color: 'red', colorLight: 'brown' })
  // send(doc, conn, encoding.toUint8Array(encoder))

  // send sync step 1
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeSyncStep1(encoder, doc)
  send(doc, conn, encoding.toUint8Array(encoder))

  // doc.awareness.getStates().set()
  const awarenessStates = doc.awareness.getStates()
  // console.log(awarenessStates)

  if (awarenessStates.size > 0) {
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageAwareness)
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys()),
      ),
    )
    send(doc, conn, encoding.toUint8Array(encoder))
  }
}
