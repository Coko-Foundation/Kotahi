import React from 'react'
import { converter, keys, schema, toolbar } from './config'
import Editor from '../Editor'

const NoteEditor = ({ value, placeholder, title, onBlur, onChange }) => (
  <Editor
    value={value}
    converter={converter}
    schema={schema}
    toolbar={toolbar}
    keys={keys}
    placeholder={placeholder}
    title={title}
    onBlur={onBlur}
    onDocumentChange={onChange}
  />
)

export default NoteEditor
