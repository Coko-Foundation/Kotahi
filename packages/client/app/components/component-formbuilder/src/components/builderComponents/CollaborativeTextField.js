import React, { useEffect, useCallback, useState } from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import { omit } from 'lodash'
import styled from 'styled-components'
import { TextField } from '@pubsweet/ui'
import { TextAreaBinding } from 'y-textarea'
import useYjs from '../../../../wax-collab/src/hooks/useYjs'

const TextFieldSyled = styled(TextField)`
  position: relative;
  .selectedText {
    border-radius: 2px;
  }

  .nameTag {
    color: white;
    font-family: Verdana, Geneva, sans-serif;
    font-weight: 400;
    font-style: italic;
    font-size: 12px;
    padding: 3px;
    border-radius: 3px;
  }
`

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

  const [text, setText] = useState(null)

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
  }, [])

  const startTextYjs = useCallback(
    node => {
      if (node !== null) {
        const rand = Math.floor(Math.random() * 3)
        const names = ['Tiger', 'Penguin', 'Cat']

        const color = [
          { r: 0, g: 0, b: 255 },
          { r: 0, g: 255, b: 0 },
          { r: 255, g: 0, b: 0 },
        ]

        const yTextInput = ydoc.getText(fieldType)
        // eslint-disable-next-line no-new
        new TextAreaBinding(yTextInput, node, {
          awareness: yjsProvider.awareness,
          clientName: names[rand],
          color: color[rand],
        })
      }
    },
    [yjsProvider, ydoc],
  )

  if (loading || !yjsProvider || !ydoc) return <p>Loading...</p>

  return (
    <TextFieldSyled
      id={input.name}
      innerRefProp={startTextYjs}
      {...omit(input, ['value', 'onChange'])}
      onChange={event => {
        setText(event.currentTarget.value)
      }}
      value={text}
    />
  )
}

export default CollaborativeTextFieldBuilder
