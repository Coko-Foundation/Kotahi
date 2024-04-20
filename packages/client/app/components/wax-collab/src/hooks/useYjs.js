/* eslint-disable react/prop-types */
import { useState, useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { ConfigContext } from '../../../config/src'

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

const useYjs = (identifier, object) => {
  const { groupId } = useContext(ConfigContext)
  const [yjsProvider, setYjsProvider] = useState(null)

  const [ydoc, setYDoc] = useState(null)

  const createYjsProvider = currentUser => {
    let ydocInstance = null

    if (ydoc) {
      ydocInstance = ydoc
    } else {
      ydocInstance = new Y.Doc()
      setYDoc(ydocInstance)
    }

    if (!identifier) {
      // eslint-disable-next-line no-param-reassign
      identifier = uuidv4()
    }

    // eslint-disable-next-line no-restricted-globals
    const provider = new WebsocketProvider(
      process.env.CLIENT_YJS_WEBSOCKET_URL,
      identifier,
      ydocInstance,
      {
        params: {
          token: localStorage.getItem('token') || '',
          groupId,
          ...object,
        },
      },
    )

    const color = arrayColor[Math.floor(Math.random() * arrayColor.length)]

    if (currentUser) {
      provider.awareness.setLocalStateField('user', {
        id: currentUser.id || uuidv4(),
        color,
        displayName: currentUser
          ? currentUser.username || currentUser.email
          : 'Anonymous',
      })
    }

    setYjsProvider(provider)
  }

  if (!object) {
    throw new Error('You need to specify a collaborativeObject')
  }

  if (!identifier) {
    throw new Error('You need to specify a Identifier')
  }

  return {
    yjsProvider,
    ydoc,
    createYjsProvider,
  }
}

export default useYjs
