import React from 'react'
import classes from './Badge.local.scss'

const Badge = ({ count, label, plural }) => (
  <span className={classes.root}>
    <span className={classes.count}>{count}</span>
    <span className={classes.label}>{plural && count !== 1 ? plural : label}</span>
  </span>
)

export default Badge
