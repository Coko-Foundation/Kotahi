import React from 'react'

const Button = ({ children, type = 'button', disabled, onClick}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}>{children}</button>
)

export default Button
