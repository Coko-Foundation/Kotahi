import React from 'react'
import { converter, keys, schema, toolbar } from './config'
import Editor from '../Editor'
import classes from './TitleEditor.local.css'

// TODO: no blocks allowed

const TitleEditor = ({ value, placeholder, title, onChange }) => (
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
  />
)

export default TitleEditor
