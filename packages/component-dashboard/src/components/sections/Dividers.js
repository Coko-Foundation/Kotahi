import React from 'react'
import classes from '../Dividers.local.scss'

export const MetadataDivider = () => (
  <span className={classes.divider}>{' - '}</span>
)

export const ActionsDivider = () => (
  <span className={classes.divider}>{' | '}</span>
)

export const LinksDivider = () => (
  <span className={classes.divider}>{' | '}</span>
)
