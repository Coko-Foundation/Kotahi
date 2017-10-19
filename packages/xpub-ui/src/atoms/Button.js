import React from 'react'
import classnames from 'classnames'
import classes from './Button.local.scss'

const Button = ({ className, children, type = 'button', disabled, primary, onClick}) => (
  <button
    className={classnames(className, classes.root, {
      [classes.disabled]: disabled,
      [classes.primary]: primary
    })}
    type={type}
    disabled={disabled}
    onClick={onClick}>{children}</button>
)

export default Button

