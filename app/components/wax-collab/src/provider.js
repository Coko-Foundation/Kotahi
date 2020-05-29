import * as Y from 'yjs'
// import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
// import { IndexeddbPersistence, storeState } from 'y-indexeddb'

const websocketUrl = 'ws://localhost:3000/w'

const lastSnapshot = null

/**
 * @param {Y.Item} item
 * @return {boolean}
 */
const gcFilter = item =>
  !Y.isParentOf(prosemirrorEditorContent, item) ||
  (lastSnapshot && (lastSnapshot.sv.get(item.id.client) || 0) <= item.id.clock)

// const suffix = '-v3'

// export const versionDoc = new Y.Doc()
// this websocket provider doesn't connect
// export const versionWebsocketProvider = new WebsocketProvider(websocketUrl, 'yjs-website-version' + suffix, versionDoc, { connect: false })
// versionWebsocketProvider.connectBc() // only connect via broadcastchannel
// export const versionIndexeddbPersistence = new IndexeddbPersistence('test', versionDoc)
// export const versionType = versionDoc.getArray('versions')

const token = localStorage.getItem('token')
export const doc = new Y.Doc({ gcFilter })
// console.log(doc.awarenessStates)
export const websocketProvider = new WebsocketProvider(
  websocketUrl,
  'test-server-given',
  doc,
  { params: { id: doc.clientID, token } },
)
// export const webrtcProvider = new WebrtcProvider('yjs-website' + suffix, doc)
export const { awareness } = websocketProvider

// export const indexeddbPersistence = new IndexeddbPersistence('yjs-website' + suffix, doc)

export const prosemirrorEditorContent = doc.getXmlFragment('prosemirror')

// versionIndexeddbPersistence.on('synced', () => {
//   lastSnapshot = versionType.length > 0 ? Y.decodeSnapshot(versionType.get(0).snapshot) : Y.emptySnapshot
//   versionType.observe(() => {
//     if (versionType.length > 0) {
//       const nextSnapshot = Y.decodeSnapshot(versionType.get(0).snapshot)
//       undoManager.clear()
//       Y.tryGc(nextSnapshot.ds, doc.store, gcFilter)
//       lastSnapshot = nextSnapshot
//       storeState(indexeddbPersistence)
//     }
//   })
// })

class LocalRemoteUserData extends Y.PermanentUserData {
  /**
   * @param {number} clientid
   * @return {string}
   */
  getUserByClientId(clientid) {
    return super.getUserByClientId(clientid) || 'remote'
  }
  /**
   * @param {Y.ID} id
   * @return {string}
   */
  getUserByDeletedId(id) {
    return super.getUserByDeletedId(id) || 'remote'
  }
}

// const lodash = require('lodash')

// Const demo users

// const users = [
//   { name: 'James', color: '#f44336', colorLight: 'e57373' },
//   { name: 'Lydia', color: '#E91E63', colorLight: '#F06292' },
//   { name: 'Bill', color: '#9C27B0', colorLight: '#BA68C8' },
//   { name: 'Farnshuw', color: '#03A9F4', colorLight: '#4FC3F7' },
//   { name: 'Giselde', color: '#009688', colorLight: '#4DB6AC' },
//   { name: 'Patrick', color: '#D4E157', colorLight: '#E6EE9C' },
// ]

export const permanentUserData = new LocalRemoteUserData(
  doc,
  doc.getMap('users'),
)
// console.log('MAP OF USERS', doc.getMap('users'))

//  versionIndexeddbPersistence.whenSynced.then(() => {
// permanentUserData.setUserMapping(doc, doc.clientID, 'local', lodash.sample(users))
// })

/**
 * An array of draw element.
 * A draw element is a Y.Map that has a type attribute. We will support only type "path", but you could also define type "text", or type "rectangle".
 *
 * @type {Y.Array<Y.Map<Y.Array|String|object>>}
 */
export const drawingContent = doc.getArray('drawing')

let undoManager = null

export const setUndoManager = nextUndoManager => {
  if (undoManager) {
    undoManager.clear()
  }
  undoManager = nextUndoManager
}

// @ts-ignore
window.ydoc = doc
// @ts-ignore
// window.versionDoc = versionDoc
// @ts-ignore
window.awareness = awareness
// @ts-ignore
// window.webrtcProvider = webrtcProvider
// @ts-ignore
window.websocketProvider = websocketProvider
// @ts-ignore
// window.indexeddbPersistence = indexeddbPersistence
// @ts-ignore
window.prosemirrorEditorContent = prosemirrorEditorContent
