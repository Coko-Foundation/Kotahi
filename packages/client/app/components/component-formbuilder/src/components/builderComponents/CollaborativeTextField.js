import React, { useEffect, useCallback, useState } from 'react'
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
    border-radius: 3px;
    color: white;
    font-family: Verdana, Geneva, sans-serif;
    font-size: 12px;
    font-style: italic;
    font-weight: 400;
    padding: 3px;
  }

  input:disabled {
    background-color: unset;
    border: 0px;
  }
`

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

function hexToRgb(h) {
  // Remove '#' if it exists
  const hex = h.replace(/^#/, '')

  // Parse the hex values for red, green, and blue components
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Return the RGB values as an object
  return { r, g, b }
}

const CollaborativeTextFieldBuilder = ({ collaborativeObject, ...input }) => {
  const fieldType = 'textInput'

  let currentUser = null

  if (collaborativeObject?.currentUser) {
    currentUser = collaborativeObject.currentUser
  }

  const [text, setText] = useState(null)

  const { yjsProvider, ydoc, createYjsProvider } = useYjs(
    `${collaborativeObject.identifier}-${input.name}`,
    { ...omit(collaborativeObject, ['identifier', 'currentUser']), fieldType },
  )

  useEffect(() => {
    createYjsProvider(currentUser)
  }, [])

  const startTextYjs = useCallback(
    node => {
      if (node !== null) {
        const color = hexToRgb(
          arrayColor[Math.floor(Math.random() * arrayColor.length)],
        )

        const yTextInput = ydoc.getText(fieldType)
        // eslint-disable-next-line no-new
        new TextAreaBinding(yTextInput, node, {
          awareness: yjsProvider.awareness,
          clientName: currentUser ? currentUser.username : 'Anonymous',
          color,
        })
      }
    },
    [yjsProvider, ydoc],
  )

  if (!yjsProvider || !ydoc) return <p>Loading...</p>

  return (
    <TextFieldSyled
      id={input.name}
      innerRefProp={startTextYjs}
      {...omit(input, ['value', 'onChange'])}
      onChange={event => {
        setText(event.currentTarget.value)
        input.onChange(`${collaborativeObject.identifier}-${input.name}`)
      }}
      value={text}
    />
  )
}

export default CollaborativeTextFieldBuilder
