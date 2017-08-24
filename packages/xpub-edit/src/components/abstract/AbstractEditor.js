import React from 'react'
import { converter, keys, schema, toolbar } from './config'
import Editor from '../Editor'
import classes from './AbstractEditor.local.css'

const AbstractEditor = ({ value, placeholder, title, onChange, onSubmit }) => (
  <Editor
    className={classes.root}
    value={value}
    converter={converter}
    schema={schema}
    toolbar={toolbar}
    keys={keys}
    placeholder={placeholder}
    title={title}
    onChange={onChange}
    onSubmit={onSubmit}
  />
)

export default AbstractEditor