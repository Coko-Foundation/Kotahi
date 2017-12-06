import React from 'react'
import Files from './Files'
import Attachment from '../atoms/Attachment'
import classes from './Attachments.local.scss'
import Icon from '../atoms/Icon'

// TODO: show upload progress

const Attachments = props => (
  <Files
    {...props}
    buttonText="Attach file"
    uploadedFile={value => <Attachment key={value.url} value={value} />}
    uploadingFile={({ file, progress, error }) => (
      <div className={classes.uploading}>
        <span className={classes.icon}>
          <Icon color="var(--color-primary)">paperclip</Icon>
        </span>
        <span className={classes.filename}>{error || 'Uploading…'}</span>
      </div>
    )}
  />
)

export default Attachments
