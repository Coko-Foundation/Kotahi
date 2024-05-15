import React, { useEffect, useContext, useCallback, useState } from 'react'
import { omit } from 'lodash'
import styled from 'styled-components'
import { TextField } from '@pubsweet/ui'
import Color from 'color'
import { TextAreaBinding } from 'y-textarea'

import { Spinner } from '../../../../shared'
import YjsContext from '../../../../provider-yjs/yjsProvider'

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
    border: 0;
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

const CollaborativeTextFieldBuilder = ({ collaborativeObject, ...input }) => {
  const { yjsProvider, ydoc } = useContext(YjsContext)
  const fieldType = `textInput-${input.name}`

  let currentUser = null

  if (collaborativeObject?.currentUser) {
    currentUser = collaborativeObject.currentUser
  }

  const [text, setText] = useState(null)

  let areaBinding = null

  useEffect(() => {
    return () => {
      areaBinding.destroy()
    }
  }, [])

  const startTextYjs = useCallback(
    node => {
      if (node !== null) {
        const color = Color(
          arrayColor[Math.floor(Math.random() * arrayColor.length)],
        )
          .rgb()
          .object()

        const yTextInput = ydoc.getText(fieldType)
        areaBinding = new TextAreaBinding(yTextInput, node, {
          awareness: yjsProvider.awareness,
          clientName: currentUser ? currentUser.username : 'Anonymous',
          color,
        })
      }
    },
    [yjsProvider, ydoc],
  )

  if (!yjsProvider || !ydoc) return <Spinner />

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
