import React from 'react'
import { converter, keys, schema, toolbar } from './config'
import Editor from '../Editor'
import classes from './NoteEditor.local.scss'

const NoteEditor = ({ value, placeholder, title, onBlur, onChange }) => (
  <Editor
    className={classes.root}
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
