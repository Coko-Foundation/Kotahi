import React, { useContext } from 'react'
import YjsContext from '../../provider-yjs/YjsProvider'

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

  const { wsProvider, ydoc } = useContext(YjsContext)

  const Component = editorMode ? Editor[editorMode] : component

  if (!wsProvider || !ydoc) return <Spinner />

  return Component ? (
    <Component
      {...rest}
      user={currentUser}
      wsProvider={wsProvider}
      ydoc={ydoc}
    />
  ) : null
}

export default CollaborativeWax
