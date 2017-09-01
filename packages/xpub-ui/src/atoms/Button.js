import React from 'react'
import classes from './Button.local.scss'

const Button = ({ children, type = 'button', disabled, onClick}) => (
  <button
    className={classes.root}
    type={type}
    disabled={disabled}
    onClick={onClick}>{children}</button>
)

export default Button
