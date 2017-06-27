import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
import { bindActionCreators } from 'redux'

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

class Upload extends React.Component {
  importFile = () => {
    const { actions, currentUser } = this.props

    const inputFile = this.fileInput.files[0]

    actions.ink(inputFile).then(response => {
      if (!response.converted) {
        console.error('No conversion')
        return
      }

      const source = response.converted

      return actions.createCollection({
        type: 'project',
        title: extractTitle(source) || generateTitle(inputFile.name),
        status: 'imported',
        statusDate: Date.now(),
        owner: currentUser.username
      }).then(({ collection }) => {
        return actions.createFragment(collection, {
          type: 'snapshot',
          version: 1,
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
    const { ink } = this.props

    return (
      <div>
        <div onClick={() => this.fileInput.click()} style={{ fontWeight: 200, display: 'flex' }}>
            <div>
              <span className={`fa fa-fw fa-4x ${ink.isFetching ? 'fa-spinner fa-spin' : 'fa-plus-circle'}`} style={{ color: '#4990E2' }}/>
            </div>

            <div style={{ flex: 1, paddingTop: 10 }}>
              <div style={{ textTransform: 'uppercase', fontSize: '200%', color: '#4990E2' }}>Submit a new manuscript</div>

              <div style={{ fontSize: '75%', color: '#aaa', lineHeight: 1, marginTop: 5 }}>upload a new Word docx file into xpub to start the submission process</div>
            </div>
          </div>

          <form style={{ display: 'none' }}>
            <input
              type="file"
              accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ref={input => (this.fileInput = input)}
              onChange={this.importFile}/>
          </form>
        </div>
    )
  }
}

Upload.propTypes = {
  actions: PropTypes.object,
  currentUser: PropTypes.object,
  ink: PropTypes.object.isRequired
}

export default connect(
  state => ({
    currentUser: state.currentUser && state.currentUser.isAuthenticated ? state.currentUser.user : null,
    ink: state.ink
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })
)(Upload)
