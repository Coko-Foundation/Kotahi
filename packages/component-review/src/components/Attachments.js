import React from 'react'
import classes from './Attachments.local.scss'
import { Icon } from 'xpub-ui'

const Attachments = ({ attachments }) => (
  <div className={classes.root}>
    {attachments.map(attachment => (
      <a
        key={attachment.url}
        download={attachment.filename}
        href={attachment.url}
        className={classes.attachment}>
        <span className={classes.icon}>
          <Icon color="cornflowerblue">paperclip</Icon>
        </span>
        <span className={classes.filename}>
          {attachment.filename}
        </span>
      </a>
    ))}
  </div>
)

export default Attachments
