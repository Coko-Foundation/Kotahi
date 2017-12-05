import React from 'react'
import classes from './Divider.local.scss'

export default ({ separator }) => (
  <span className={classes.root}>{` ${separator} `}</span>
)
