import React from 'react'
import classes from './UploadingFile.local.scss'

// TODO: cancel button

const extension = ({ name }) => name.replace(/^.+\./, '')

const UploadingFile = ({ file, error, progress }) => (
  <div className={classes.root}>
    {!!error && <div className={classes.error}>{error}</div>}

    <div className={classes.icon}>
      {!!progress && (
        <div
          className={classes.progress}
          style={{ top: progress * 100 + '%' }}
        />
      )}

      <div className={classes.extension}>{extension(file)}</div>
    </div>

    <div className={classes.name}>{file.name}</div>
  </div>
)

export default UploadingFile
