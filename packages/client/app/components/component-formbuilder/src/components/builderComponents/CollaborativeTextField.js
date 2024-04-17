import React, { useEffect, useRef, useState } from 'react'
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
  ...input
}) => {
  const fieldType = 'textInput'
  const inputRef = useRef(null)
  // const [text, setText] = useState(input.value)

  const [getUser, { loading }] = useLazyQuery(GET_CURRENT_USER, {
    fetchPolicy: 'network-only',
    onCompleted: data => {
      if (data && data.currentUser) {
        createYjsProvider(data.currentUser)
      }
    },
  })

  const { yjsProvider, ydoc, createYjsProvider } = useYjs(
    `${collaborativeObject.identifier}-${input.name}`,
    { ...omit(collaborativeObject, ['identifier']), fieldType },
  )

  useEffect(() => {
    if (user) {
      createYjsProvider(user)
    } else {
      getUser()
    }

    if (inputRef.current) {
      console.log(inputRef.current)
    }
  }, [])

  if (loading || !yjsProvider || !ydoc) return <p>Loading...</p>

  // const yTextInput = ydoc.getText(fieldType)

  yjsProvider.on('status', event => {
    console.log(event, 1) // logs "connected" or "disconnected"
  })

  // console.log(inputRef.current)

  // if (inputRef.current) {
  //   console.log(yTextInput, inputRef.current)
  //   // eslint-disable-next-line no-new
  //   new TextAreaBinding(yTextInput, inputRef.current, {
  //     awareness: yjsProvider.awareness,
  //     clientName: 'wonder',
  //   })
  // }

  return (
    <input
      // onChange={event => {
      //   setText(event.currentTarget.value)
      // }}
      ref={inputRef}
      type="text"
      // value={text}
    />
  )
  // return (
  //   <TextField
  //     innerRefProp={inputRef}
  //     {...omit(input, ['value', 'onChange'])}
  //   />
  // )
}

export default CollaborativeTextFieldBuilder
