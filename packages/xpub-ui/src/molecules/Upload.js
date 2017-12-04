import React from 'react'

// TODO: retry on error
// TODO: make this a HOC for <UploadingFile>?

class Upload extends React.Component {
  state = {
    progress: 0,
    error: undefined,
  }

  componentDidMount() {
    const { request } = this.props

    request.addEventListener('progress', this.handleProgress)
    request.addEventListener('load', this.handleLoad)
    request.addEventListener('error', this.handleError)
    request.addEventListener('abort', this.handleAbort)
  }

  // TODO: 'progress' event not being fired often enough?
  handleProgress = event => {
    if (!event.lengthComputable) return

    this.setState({
      progress: event.loaded / event.total,
    })
  }

  handleLoad = event => {
    if (this.props.request.status === 200) {
      this.setState({
        progress: 1,
      })

      this.props.handleUploadedFile({
        file: this.props.file,
        url: this.props.request.responseText,
      })
    } else {
      this.setState({
        error: 'There was an error',
      })
    }
  }

  handleError = event => {
    this.setState({
      error: 'There was an error',
    })
  }

  handleAbort = event => {
    this.setState({
      error: 'The upload was cancelled',
    })
  }

  render() {
    const { file, render } = this.props
    const { progress, error } = this.state

    return render({ file, progress, error })
  }
}

export default Upload
