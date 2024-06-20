/* eslint-disable react/prop-types */

import React, { useState, useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { ConfigContext } from '../config/src'

const YjsContext = React.createContext({
  jsProvider: null,
  ydoc: null,
  createYjsProvider: () => {},
})

const { Provider, Consumer } = YjsContext

const arrayColor = [
  '#4363d8',
  '#ffe119',
  '#800000',
  '#dcbeff',
  '#000075',
  '#f58231',
  '#469990',
  '#f032e6',
  '#9a6324',
  '#42d4f4',
  '#e6194b',
  '#fabed4',
  '#3cb44b',
  '#911eb4',
  '#bfef45',
  '#808000',
  '#ffd8b1',
  '#aaffc3',
]

const YjsProvider = ({ children }) => {
  const { groupId } = useContext(ConfigContext)
  const [wsProvider, setWsProvider] = useState(null)
  const [ydoc, setYDoc] = useState(null)

  const createYjsProvider = ({ currentUser, object, identifier }) => {
    if (!object) {
      throw new Error('You need to specify a collaborativeObject')
    }

    if (!identifier) {
      throw new Error('You need to specify a Identifier')
    }

    let ydocInstance = null

    if (ydoc) {
      ydocInstance = ydoc
    } else {
      ydocInstance = new Y.Doc()
      setYDoc(ydocInstance)
    }

    let provider = null

    if (wsProvider) {
      provider = wsProvider
    } else {
      if (!identifier) {
        // eslint-disable-next-line no-param-reassign
        identifier = uuidv4()
      }

      // eslint-disable-next-line no-restricted-globals
      provider = new WebsocketProvider(
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
    }

    setWsProvider(provider)
  }

  return (
    <Provider
      value={{
        wsProvider,
        ydoc,
        createYjsProvider,
      }}
    >
      {children}
    </Provider>
  )
}

export { Consumer as YjsConsumer, YjsProvider }

export default YjsContext
