import React, { useEffect } from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import { omit } from 'lodash'
import Editor from '.'
import useYjs from './hooks/useYjs'

const GET_CURRENT_USER = gql`
  query currentUser {
    currentUser {
      id
      email
      username
    }
  }
`

const CollaborativeWax = ({
  editorMode,
  user,
  collaborativeObject,
  identifier,
  ...rest
}) => {
  const [getUser, { loading }] = useLazyQuery(GET_CURRENT_USER, {
    fetchPolicy: 'network-only',
    onCompleted: data => {
      if (data && data.currentUser) {
        createYjsProvider(data.currentUser)
      }
    },
  })

  const { yjsProvider, ydoc, createYjsProvider } = useYjs(
    identifier,
    omit(collaborativeObject, ['identifier']),
  )

  const Component = Editor[editorMode]

  useEffect(() => {
    if (user) {
      createYjsProvider(user)
    } else {
      getUser()
    }
  }, [])

  if (loading || !yjsProvider || !ydoc) return <p>Loading...</p>

  if (Component) {
    return (
      <Component {...rest} user={user} ydoc={ydoc} yjsProvider={yjsProvider} />
    )
  }

  throw new Error(`There is no Editor by the name: ${editorMode}`)
}

export default CollaborativeWax
