import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import classnames from 'classnames'
import { Icon } from '@pubsweet/ui'
import classes from './UploadManuscript.local.scss'

const isIdle = conversion =>
  !(conversion.converting || conversion.complete || conversion.error)

class UploadManuscript extends Component {
  constructor(props) {
    super(props)
    this.state = {
      complete: props.conversion.complete,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.conversion.complete === true) {
      this.setState({
        complete: true,
      })
    }
  }

  render() {
    const { uploadManuscript, conversion } = this.props
    return (
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
                {this.state.complete ? 'check_circle' : 'plus_circle'}
              </Icon>
            </span>
          </div>

          <div className={classes.main}>
            {conversion.error ? (
              <div className={classes.error}>{conversion.error.message}</div>
            ) : (
              <div className={classes.info}>
                {this.state.complete
                  ? 'Submission created'
                  : 'Create submission'}
              </div>
            )}
          </div>
        </div>
      </Dropzone>
    )
  }
}

export default UploadManuscript
