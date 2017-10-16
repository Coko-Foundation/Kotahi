import React from 'react'
import { converter, keys, plugins, schema, toolbar } from './config'
import Editor from '../Editor'

const NoteEditor = ({ value, placeholder, title, onBlur, onChange }) => (
  <Editor
    value={value}
    converter={converter}
    schema={schema}
    toolbar={toolbar}
    keys={keys}
    placeholder={placeholder}
    plugins={plugins}
    title={title}
    onBlur={onBlur}
    onDocumentChange={onChange}
  />
)

export default NoteEditor
