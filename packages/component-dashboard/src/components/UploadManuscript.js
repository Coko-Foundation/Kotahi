import React from 'react'
import Dropzone from 'react-dropzone'
import classnames from 'classnames'
import classes from './UploadManuscript.local.css'

// TODO: move isConverting from global state to local state

const generateTitle = (name) => {
  return name
    .replace(/[_-]+/g, ' ') // convert hyphens/underscores to space
    .replace(/\.[^.]+$/, '') // remove file extension
}

// TODO: preserve italics (use parse5?)
const extractTitle = (source) => {
  const doc = new DOMParser().parseFromString(source, 'text/html')
  const heading = doc.querySelector('h1')

  return heading ? heading.textContent : null
}

class UploadManuscript extends React.Component {
  state = {
    converting: false,
    complete: undefined,
    error: undefined
  }

  onDrop = acceptedFiles => {
    const { convertToHTML, createProject, createVersion } = this.props

    const inputFile = acceptedFiles[0]

    this.setState({
      converting: true,
      complete: false,
      error: undefined
    })

    convertToHTML(inputFile).then(response => {
      if (!response.converted) {
        throw new Error('The file was not converted')
      }

      const source = response.converted
      const title = extractTitle(source) || generateTitle(inputFile.name)

      return createProject({
        type: 'project',
      }).then(({ collection: project }) => {
        if (!project.id) {
          throw new Error('Failed to create a project')
        }

        return createVersion(project, {
          type: 'version',
          version: 1,
          source,
          title
        }).then(() => {
          this.setState({ complete: true })
        })
      })
    }).catch(error => {
      this.setState({ error: error.message })
    })
  }

  render () {
    const { converting, complete, error } = this.props

    return (
      <Dropzone
        onDrop={this.onDrop}
        accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className={classes.dropzone}>
        <div className={classes.main}>
          <div className={classnames(classes.icon, {
            [classes.converting]: converting,
            [classes.complete]: complete
          })}>
            <span>+</span>
          </div>

          <div className={classes.info}>
            {error ? error : 'Start a new submission'}
          </div>
        </div>
      </Dropzone>
    )
  }
}

export default UploadManuscript
