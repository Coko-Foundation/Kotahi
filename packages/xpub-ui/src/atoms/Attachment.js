import React from 'react'
import Icon from './Icon'
import classes from './Attachment.local.scss'

const Attachment = ({ value }) => (
  <a download={value.name} href={value.url}>
    <span className={classes.icon}>
      <Icon color="var(--color-primary)">paperclip</Icon>
    </span>
    <span className={classes.filename}>{value.name}</span>
  </a>
)

export default Attachment
