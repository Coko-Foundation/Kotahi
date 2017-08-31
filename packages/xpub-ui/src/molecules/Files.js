import React from 'react'
import classes from './Files.local.css'
import Upload from './Upload'
import File from '../atoms/File'

class Files extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      values: props.value || [],
      uploads: []
    }
  }

  handleClick = () => {
    this.fileInput.click()
  }

  handleChange = event => {
    const { uploadFile } = this.props
    const { uploads } = this.state

    Array.from(event.target.files).forEach(file => {
      uploads.push({
        file,
        request: uploadFile(file)
      })
    })

    this.setState({ uploads })
  }

  render () {
    const { name } = this.props
    const { values, uploads } = this.state

    return (
      <div className={classes.root}>
        <div className={classes.upload}>
          <button
            type="button"
            className={classes.button}
            onClick={() => this.fileInput.click()}>
            ▲ Upload files
          </button>

          <input
            className={classes.input}
            ref={input => (this.fileInput = input)}
            type="file"
            name={name}
            multiple
            onChange={this.handleChange}/>
        </div>

        <div className={classes.files}>
          {uploads && uploads.map(upload => (
            <Upload
              key={upload.file.name}
              file={upload.file}
              request={upload.request}/>
          ))}

          {values && values.map(value => (
            <File
              key={value.id}
              value={value}/>
          ))}
        </div>
      </div>
    )
  }
}

export default Files
