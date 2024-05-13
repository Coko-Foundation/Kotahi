import React, { useContext } from 'react'
import YjsContext from '../../provider-yjs/yjsProvider'

import Editor from '.'

import { Spinner } from '../../shared'

const CollaborativeWax = ({
  editorMode,
  component,
  user,
  collaborativeObject,
  identifier,
  ...rest
}) => {
  const { currentUser } = collaborativeObject

  const { yjsProvider, ydoc } = useContext(YjsContext)

  const Component = editorMode ? Editor[editorMode] : component

  if (!yjsProvider || !ydoc) return <Spinner />

  if (Component) {
    return (
      <Component
        {...rest}
        user={currentUser}
        ydoc={ydoc}
        yjsProvider={yjsProvider}
      />
    )
  }

  throw new Error(`There is no Editor by the name: ${editorMode}`)
}

export default CollaborativeWax
