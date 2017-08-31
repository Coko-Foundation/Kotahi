import React from 'react'
import UploadingFile from '../atoms/UploadingFile'

// TODO: retry on error
// TODO: make this a HOC for <UploadingFile>?

class Upload extends React.Component {
  state = {
    progress: 0,
    error: undefined,
  }

  componentDidMount () {
    const { request } = this.props

    request.addEventListener('progress', this.handleProgress)
    request.addEventListener('load', this.handleLoad)
    request.addEventListener('error', this.handleError)
  }

  handleProgress = event => {
    if (!event.lengthComputable) return

    this.setState({
      progress: event.loaded / event.total
    })
  }

  handleLoad = event => {
    if (this.props.request.status === 200) {
      this.setState({
        progress: 1
      })

      this.props.handleUploadedFile({
        file: this.props.file,
        url: this.props.request.responseText
      })
    } else {
      this.setState({
        error: 'There was an error'
      })
    }
  }

  handlError = event => {
    this.setState({
      error: 'There was an error'
    })
  }

  render () {
    const { file } = this.props
    const { progress, error } = this.state

    return (
      <UploadingFile
        file={file}
        progress={progress}
        error={error}/>
    )
  }
}

export default Upload
