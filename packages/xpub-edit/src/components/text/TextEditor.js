import React from 'react'
import { converter } from './config'
import Editor from '../Editor'

// TODO: only allow a single line of text (no line-breaks)
// TODO: ensure that content is saved when component is unmounted or blurred

const TextEditor = ({ value, placeholder, title, onBlur, onChange }) => (
  <Editor
    value={value}
    converter={converter}
    placeholder={placeholder}
    title={title}
    onBlur={onBlur}
    onChange={onChange}
  />
)

export default TextEditor
