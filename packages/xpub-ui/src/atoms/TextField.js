import React from 'react'
import classes from './TextField.local.scss'

const TextField = ({
  label,
  name,
  placeholder,
  required,
  type = 'text',
  value = '',
  onBlur,
  onChange,
}) => (
  <label className={classes.root}>
    {label && <span className={classes.text}>{label}</span>}
    <input
      className={classes.input}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      onBlur={onBlur}
      onChange={onChange}
    />
  </label>
)

export default TextField
