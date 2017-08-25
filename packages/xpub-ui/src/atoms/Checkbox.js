import React from 'react'
import classnames from 'classnames'
import classes from './Checkbox.local.css'

const Checkbox = ({ inline, name, value, label, checked, required, onChange }) => (
  <label className={classnames(classes.root, {
    [classes.inline]: inline
  })}>
    <input
      className={classes.input}
      type="checkbox"
      name={name}
      value={value}
      checked={checked || false}
      required={required}
      onChange={onChange}/>
    {label}
  </label>
)

export default Checkbox
