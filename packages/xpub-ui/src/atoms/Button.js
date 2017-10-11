import React from 'react'
import classnames from 'classnames'
import classes from './Button.local.scss'

const Button = ({ children, type = 'button', back, disabled, primary, onClick}) => (
  <button
    className={classnames(classes.root, {
      [classes.disabled]: disabled,
      [classes.back]: back,
      [classes.primary]: primary
    })}
    type={type}
    disabled={disabled}
    onClick={onClick}>{children}</button>
)

export default Button

