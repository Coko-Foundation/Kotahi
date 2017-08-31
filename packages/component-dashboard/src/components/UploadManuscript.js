import React from 'react'
import Dropzone from 'react-dropzone'
import classnames from 'classnames'
import { Icon } from 'xpub-ui'
import classes from './UploadManuscript.local.css'

const UploadManuscript = ({ uploadManuscript, conversion }) => (
  <Dropzone
    onDrop={uploadManuscript}
    accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    className={classes.dropzone}>
    <div className={classes.main}>
      <div className={classnames({
        [classes.converting]: conversion.converting,
        [classes.complete]: conversion.complete
      })}>
        <span className={classes.icon}>
          <Icon color="cornflowerblue">
            {conversion.complete ? 'check_circle' : 'plus_circle'}
          </Icon>
        </span>
      </div>

      {conversion.error ? (
        <div className={classes.error}>
          {conversion.error.message}
        </div>
      ) : (
        <div className={classes.info}>
          {conversion.complete ? 'Submission created' : 'Create submission'}
        </div>
      )}
    </div>
  </Dropzone>
)

export default UploadManuscript
