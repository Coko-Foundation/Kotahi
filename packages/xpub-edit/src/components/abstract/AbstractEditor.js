import React from 'react'
import { converter, keys, schema, toolbar } from './config'
import Editor from '../Editor'

const AbstractEditor = ({ value, placeholder, placeholderClassName, title, onBlur, onChange }) => (
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

export default AbstractEditor
