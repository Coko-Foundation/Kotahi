import React, { useEffect, useRef } from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import { omit } from 'lodash'
import { TextField } from '@pubsweet/ui'
import { TextAreaBinding } from 'y-textarea'
import useYjs from '../../../../wax-collab/src/hooks/useYjs'

const GET_CURRENT_USER = gql`
  query currentUser {
    currentUser {
      id
      email
      username
    }
  }
`

const CollaborativeTextFieldBuilder = ({
  user,
  collaborativeObject,
  identifier,
  ...input
}) => {
  const inputRef = useRef(null)

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

  useEffect(() => {
    if (user) {
      createYjsProvider(user)
    } else {
      getUser()
    }

    if (yjsProvider && ydoc) {
      const yTextInput = ydoc.getText('textInput')

      // eslint-disable-next-line no-new
      new TextAreaBinding(yTextInput, inputRef.current, {
        awareness: yjsProvider.awareness,
        clientName: 'wonder',
      })
    }
  }, [])

  if (loading || !yjsProvider || !ydoc) return <p>Loading...</p>

  return <TextField ref={inputRef} {...input} />
}

export default CollaborativeTextFieldBuilder
