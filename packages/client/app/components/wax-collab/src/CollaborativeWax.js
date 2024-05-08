import React, { useEffect } from 'react'
import { omit } from 'lodash'
import Editor from '.'

import { Spinner } from '../../shared'
import useYjs from './hooks/useYjs'

const CollaborativeWax = ({
  editorMode,
  component,
  user,
  collaborativeObject,
  identifier,
  ...rest
}) => {
  const { currentUser } = collaborativeObject

  const { yjsProvider, ydoc, createYjsProvider } = useYjs(identifier, {
    ...omit(collaborativeObject, ['identifier', 'currentUser']),
  })

  const Component = editorMode ? Editor[editorMode] : component

  useEffect(() => {
    createYjsProvider(currentUser)
  }, [])

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
