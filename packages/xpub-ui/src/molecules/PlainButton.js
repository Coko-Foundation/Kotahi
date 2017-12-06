import React from 'react'
import classnames from 'classnames'
import Button from '../atoms/Button'
import classes from './PlainButton.local.scss'

const PlainButton = ({
  className,
  children,
  type,
  disabled,
  primary,
  onClick,
}) => (
  <Button
    className={classnames(classes.root, className)}
    disabled={disabled}
    onClick={onClick}
    primary={primary}
    type={type}
  >
    {children}
  </Button>
)

export default PlainButton
