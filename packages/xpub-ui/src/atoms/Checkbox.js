import React from 'react'
import classnames from 'classnames'
import classes from './Checkbox.local.scss'

const Checkbox = ({
  inline,
  name,
  value,
  label,
  checked,
  required,
  onChange,
}) => (
  <label
    className={classnames(classes.root, {
      [classes.inline]: inline,
    })}
  >
    <input
      className={classes.input}
      type="checkbox"
      name={name}
      value={value}
      checked={checked || false}
      required={required}
      onChange={onChange}
    />
    <span>{label}</span>
  </label>
)

export default Checkbox
