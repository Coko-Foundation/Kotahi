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
  readonly,
}) => (
  <label
    className={classnames(classes.root, {
      [classes.inline]: inline,
    })}
  >
    <input
      checked={checked || false}
      className={classes.input}
      disabled={readonly}
      name={name}
      onChange={onChange}
      required={required}
      type="checkbox"
      value={value}
    />
    <span>{label}</span>
  </label>
)

export default Checkbox
