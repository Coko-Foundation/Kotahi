import React from 'react'
import { converter, keys, schema, toolbar } from './config'
import Editor from '../Editor'

// TODO: no blocks allowed

const TitleEditor = ({ value, placeholder, title, onChange }) => (
  <Editor
    value={value}
    converter={converter}
    schema={schema}
    toolbar={toolbar}
    keys={keys}
    placeholder={placeholder}
    title={title}
    onDocumentChange={onChange}
  />
)

export default TitleEditor
