import React from 'react'
import classes from './Files.local.scss'
import Upload from './Upload'

class Files extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      values: props.value || [],
      uploads: [],
    }
  }

  handleClick() {
    this.fileInput.click()
  }

  handleChange(event) {
    const { uploads } = this.state

    Array.from(event.target.files).forEach(file => {
      uploads.push({
        file,
        request: this.props.uploadFile(file),
      })
    })

    this.setState({ uploads })
  }

  handleUploadedFile({ file, url }) {
    const values = this.state.values.concat({
      name: file.name,
      url,
    })

    const uploads = this.state.uploads.filter(
      item => item.file.name !== file.name,
    )

    this.setState({ values, uploads })

    this.props.onChange(values)
  }

  render() {
    const { name, buttonText, uploadingFile, uploadedFile } = this.props
    const { values, uploads } = this.state

    return (
      <div className={classes.root}>
        <div className={classes.upload}>
          <button
            className={classes.attach}
            onClick={() => this.fileInput.click()}
            type="button"
          >
            {buttonText}
          </button>

          <input
            className={classes.input}
            multiple
            name={name}
            onChange={this.handleChange}
            ref={input => (this.fileInput = input)}
            type="file"
          />
        </div>

        <div className={classes.files}>
          {uploads &&
            uploads.map(upload => (
              <Upload
                file={upload.file}
                handleUploadedFile={this.handleUploadedFile}
                key={upload.file.name}
                render={uploadingFile}
                request={upload.request}
              />
            ))}

          {values && values.map(uploadedFile)}
        </div>
      </div>
    )
  }
}

export default Files
