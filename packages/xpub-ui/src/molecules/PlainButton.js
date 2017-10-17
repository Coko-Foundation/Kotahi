import React from 'react'
import classnames from 'classnames'
import Button from '../atoms/Button'
import classes from './PlainButton.local.scss'

const PlainButton = ({ className, children, type, disabled, primary, onClick }) => (
  <Button
    className={classnames(className, classes.root)}
    type={type}
    primary={primary}
    disabled={disabled}
    onClick={onClick}>{children}</Button>
)

export default PlainButton

