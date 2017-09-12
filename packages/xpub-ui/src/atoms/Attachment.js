import React from 'react'
import Icon from './Icon'
import classes from './Attachment.local.scss'

const Attachment = ({ value }) => (
  <a
    key={value.url}
    download={value.name}
    href={value.url}
    className={classes.attachment}>
    <span className={classes.icon}>
      <Icon color="cornflowerblue">paperclip</Icon>
    </span>
    <span className={classes.filename}>
      {value.name}
    </span>
  </a>
)

export default Attachment
