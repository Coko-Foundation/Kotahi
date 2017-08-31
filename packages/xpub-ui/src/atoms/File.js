import React from 'react'
import classes from './File.local.css'

const extension = ({ name }) => name.replace(/^.+\./, '')

const File = ({ value, file, error, progress }) => (
  <div className={classes.root}>
    <div className={classes.icon}>
      <div className={classes.extension}>
        {extension(value)}
      </div>
    </div>

    <div className={classes.name}>
      <a href={value.url}>
        {value.name}
      </a>
    </div>
  </div>
)

export default File
