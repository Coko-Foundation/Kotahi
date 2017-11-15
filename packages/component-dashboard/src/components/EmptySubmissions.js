import React from 'react'
import UploadManuscript from './UploadManuscript'
import classes from './EmptySubmissions.local.scss'

const EmptySubmissions = ({ text, conversion, uploadManuscript }) => (
  <div className={classes.root}>
    <div>{text}</div>
    {uploadManuscript && (
      <UploadManuscript
        conversion={conversion}
        uploadManuscript={uploadManuscript}
        text={'Click here to create a submission.'}
      />
    )}
  </div>
)

export default EmptySubmissions
