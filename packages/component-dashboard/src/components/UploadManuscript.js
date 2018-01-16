import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import classnames from 'classnames'
import { Icon } from '@pubsweet/ui'
import classes from './UploadManuscript.local.scss'

const isIdle = conversion => !(conversion.converting || conversion.error)

class UploadManuscript extends Component {
  constructor(props) {
    super(props)
    this.state = {
      completed: false,
      error: false,
    }
    this.showErrorAndHide = this.showErrorAndHide.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.conversion.converting !== nextProps.conversion.converting &&
      this.props.conversion.converting === true
    ) {
      this.setState({
        completed: true,
        error: false,
      })
    }

    if (nextProps.conversion.error !== undefined) {
      this.showErrorAndHide()
    }
  }

  showErrorAndHide() {
    this.setState({
      error: true,
      completed: false,
    })
    setTimeout(() => {
      this.setState({
        error: false,
        completed: false,
      })
    }, 3000)
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
              [classes.error]: this.state.error,
            })}
          >
            <span className={classes.icon}>
              <Icon color="var(--color-primary)">
                {this.state.completed ? 'check_circle' : 'plus_circle'}
              </Icon>
            </span>
          </div>

          <div className={classes.main}>
            {this.state.error ? (
              <div className={classes.error}>{conversion.error.message}</div>
            ) : (
              <div className={classes.info}>
                {this.state.completed
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
