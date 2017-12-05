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
  readonly,
}) => (
  <label className={classes.root}>
    {label && <span className={classes.text}>{label}</span>}
    <input
      className={classes.input}
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readonly}
      required={required}
      type={type}
      value={value}
    />
  </label>
)

export default TextField
