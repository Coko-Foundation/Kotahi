/* eslint-disable react/prop-types */
import { uuid } from '@coko/server'
import { useState } from 'react'
import { WebsocketProvider } from 'y-websocket'

import * as Y from 'yjs'

const { CLIENT_YJS_WEBSOCKET_URL } = process.env

const arrayColor = [
  '#D9E3F0',
  '#F47373',
  '#697689',
  '#37D67A',
  '#2CCCE4',
  '#555555',
  '#dce775',
  '#ff8a65',
  '#ba68c8',
]

const useYjs = (identifier, currentUser) => {
  const [yjsProvider, setYjsProvider] = useState(null)
  const [ydoc, setYDoc] = useState(null)

  const createYjsProvider = () => {
    let ydocInstance = null

    if (ydoc) {
      ydocInstance = ydoc
    } else {
      ydocInstance = new Y.Doc()
      setYDoc(ydocInstance)
    }

    if (!identifier) {
      // eslint-disable-next-line no-param-reassign
      identifier = Array.from(Array(20), () =>
        Math.floor(Math.random() * 36).toString(36),
      ).join('')
    }

    // eslint-disable-next-line no-restricted-globals
    const provider = new WebsocketProvider(
      CLIENT_YJS_WEBSOCKET_URL,
      identifier,
      ydocInstance,
      { params: { token: localStorage.getItem('token') || '' } },
    )

    const color = arrayColor[Math.floor(Math.random() * arrayColor.length)]

    provider.awareness.setLocalStateField('user', {
      id: currentUser.id || uuid(),
      color,
      displayName: currentUser
        ? currentUser.displayName || currentUser.email
        : 'Anonymous',
    })

    setYjsProvider(provider)
  }

  return {
    yjsProvider,
    ydoc,
    createYjsProvider,
  }
}

export default useYjs
