import React from 'react'

const Button = ({ children, type = 'button', disabled}) => (
  <button
    type={type}
    disabled={disabled}>{children}</button>
)

export default Button
