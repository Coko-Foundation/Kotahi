import React, { useEffect } from 'react'

import Editor from '.'
import useYjs from './hooks/useYjs'

const CollaborativeWax = ({ editorMode, user, ...rest }) => {
  const { yjsProvider, ydoc, createYjsProvider } = useYjs(user)

  const Component = Editor[editorMode]

  useEffect(() => {
    createYjsProvider()
  }, [])

  if (Component) {
    return (
      <Component {...rest} user={user} ydoc={ydoc} yjsProvider={yjsProvider} />
    )
  }

  throw new Error(`There is no Editor by the name: ${editorMode}`)
}

export default CollaborativeWax
