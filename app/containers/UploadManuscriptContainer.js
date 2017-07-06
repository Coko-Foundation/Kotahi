import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createCollection } from 'pubsweet-client/src/actions/collections'
import { createFragment } from 'pubsweet-client/src/actions/fragments'
import { ink as convertToHTML } from 'pubsweet-component-ink-frontend/actions'
import uuid from 'uuid'
import UploadManuscript from '../components/UploadManuscript'

const generateTitle = (name) => {
  return name
    .replace(/[_-]+/g, ' ') // convert hyphens/underscores to space
    .replace(/\.[^.]+$/, '') // remove file extension
}

// TODO: preserve italics
const extractTitle = (source) => {
  const doc = new DOMParser().parseFromString(source, 'text/html')
  const heading = doc.querySelector('h1')

  return heading ? heading.textContent : null
}

class UploadManuscriptContainer extends React.Component {
  onDrop = (acceptedFiles) => {
    const { convertToHTML, createCollection, createFragment, currentUser } = this.props

    const inputFile = acceptedFiles[0]

    convertToHTML(inputFile).then(response => {
      if (!response.converted) {
        console.error('No conversion')
        return
      }

      const source = response.converted

      const roles = {
        owner: {},
        editor: {},
        reviewer: {}
      }

      roles.owner[uuid()] = {
        user: {
          id: currentUser.id,
          username: currentUser.username
        }
      }

      return createCollection({
        type: 'project',
        title: extractTitle(source) || generateTitle(inputFile.name),
        status: 'imported',
        statusDate: Date.now(),
        roles
      }).then(({ collection }) => {
        if (!collection.id) {
          throw new Error('Failed to create a collection')
        }

        return createFragment(collection, {
          type: 'version',
          version: 0,
          source
        })
      }).catch(error => {
        console.error('Creation error', error)
      })
    }).catch(error => {
      console.error('INK error', error)
    })
  }

  render () {
    return <UploadManuscript onDrop={this.onDrop} ink={this.props.ink}/>
  }
}

UploadManuscriptContainer.propTypes = {
  currentUser: PropTypes.object,
  convertToHTML: PropTypes.func.isRequired,
  createCollection: PropTypes.func.isRequired,
  createFragment: PropTypes.func.isRequired,
  ink: PropTypes.func.isRequired
}

export default connect(
  state => ({
    currentUser: state.currentUser.isAuthenticated ? state.currentUser.user : null,
    ink: state.ink
  }),
  {
    convertToHTML,
    createCollection,
    createFragment
  }
)(UploadManuscriptContainer)
