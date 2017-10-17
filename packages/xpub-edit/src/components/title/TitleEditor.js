import React from 'react'
import { converter, keys, schema, toolbar } from './config'
import Editor from '../Editor'

// TODO: no blocks allowed

const TitleEditor = ({ className, value, placeholder, title, onBlur, onChange }) => (
  <Editor
    className={className}
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

export default TitleEditor
