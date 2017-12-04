import React from 'react'
import classnames from 'classnames'
import classes from './Radio.local.scss'

const inputGradient = color =>
  `radial-gradient(closest-corner at center, ${color} 0%, ${
    color
  } 45%, white 45%, white 100%)`

const Radio = ({
  className,
  color = 'black',
  inline,
  name,
  value,
  label,
  checked,
  required,
  onChange,
}) => (
  <label
    className={classnames(
      classes.root,
      {
        [classes.inline]: inline,
        [classes.checked]: checked,
      },
      className,
    )}
    style={{ color }}
  >
    <input
      className={classes.input}
      type="radio"
      name={name}
      value={value}
      checked={checked}
      required={required}
      onChange={onChange}
    />
    <span
      className={classes.pseudoInput}
      style={{ background: checked ? inputGradient(color) : 'transparent' }}
    >
      {' '}
    </span>
    <span className={classes.label}>{label}</span>
  </label>
)

export default Radio
