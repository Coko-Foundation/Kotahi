import React from 'react'
import Dropzone from 'react-dropzone'
import classnames from 'classnames'
import { Icon } from '@pubsweet/ui'
import classes from './UploadManuscript.local.scss'

const isIdle = conversion =>
  !(conversion.converting || conversion.complete || conversion.error)

const UploadManuscript = ({ uploadManuscript, conversion }) => (
  <Dropzone
    accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    className={classes.dropzone}
    onDrop={uploadManuscript}
  >
    <div className={classes.root}>
      <div
        className={classnames({
          [classes.idle]: isIdle(conversion),
          [classes.converting]: conversion.converting,
          [classes.error]: conversion.error,
          [classes.complete]: conversion.complete,
        })}
      >
        <span className={classes.icon}>
          <Icon color="var(--color-primary)">
            {conversion.complete ? 'check_circle' : 'plus_circle'}
          </Icon>
        </span>
      </div>

      <div className={classes.main}>
        {conversion.error ? (
          <div className={classes.error}>{conversion.error.message}</div>
        ) : (
          <div className={classes.info}>
            {conversion.complete ? 'Submission created' : 'Create submission'}
          </div>
        )}
      </div>
    </div>
  </Dropzone>
)

export default UploadManuscript
