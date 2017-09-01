import React from 'react'
import classes from './TextField.local.css'

const TextField = ({ label, name, required, type = 'text', value, onChange }) => (
  <label className={classes.root}>
    <span className={classes.text}>{label}</span>
    <input
      className={classes.input}
      name={name}
      type={type}
      value={value}
      required={required}
      onChange={onChange}/>
  </label>
)

export default TextField
