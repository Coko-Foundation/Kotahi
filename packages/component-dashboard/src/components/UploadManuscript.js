import React from 'react'
import Dropzone from 'react-dropzone'
import classnames from 'classnames'
import { Icon } from 'xpub-ui'
import classes from './UploadManuscript.local.scss'

const isIdle = conversion => !(conversion.converting || conversion.complete || conversion.error)

const UploadManuscript = ({ uploadManuscript, conversion, text }) => (
  <Dropzone
    onDrop={uploadManuscript}
    accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    className={classes.dropzone}
  >
    <div className={classes.root}>
      {text ? (
        <span className={classes['upload-text']}>{text}</span>
      ) : (
        [
          <div
            key="submitIcon"
            className={classnames({
              [classes.idle]: isIdle(conversion),
              [classes.converting]: conversion.converting,
              [classes.error]: conversion.error,
              [classes.complete]: conversion.complete
            })}
          >
            <span className={classes.icon}>
              <Icon color="var(--color-primary)">{conversion.complete ? 'check_circle' : 'plus_circle'}</Icon>
            </span>
          </div>,
          <div className={classes.main} key="submitText">
            {conversion.error ? (
              <div className={classes.error}>{conversion.error.message}</div>
            ) : (
              <div className={classes.info}>
                {conversion.complete ? 'Submission created' : 'Create submission'}
              </div>
            )}
          </div>
        ]
      )}
    </div>
  </Dropzone>
)

export default UploadManuscript
