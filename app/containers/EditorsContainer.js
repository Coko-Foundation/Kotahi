import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import EditorForm from '../components/EditorForm'
import EditorList from '../components/EditorList'

class EditorsContainer extends React.Component {
  render () {
    const { project, updateCollection } = this.props

    if (!project) return null

    const { roles } = project

    // TODO: only return editor details from the server to authorised users
    // TODO: implement role status (+ invitations property?)

    return (
      <div className="content-metadata">
        <h1>Editor</h1>

        <div className="content-interactive">
          <EditorForm project={project} updateCollection={updateCollection()}/>
        </div>

        {roles.editor && (
          <div className="content-metadata">
            <EditorList project={project} roles={roles.editor}/>
          </div>
        )}
      </div>
    )
  }
}

EditorsContainer.propTypes = {
  params: PropTypes.object.isRequired,
  project: PropTypes.object,
  updateCollection: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    project: state.collections.find(collection => {
      return collection.id === ownProps.params.project
    })
  }),
  {
    updateCollection
  }
)(EditorsContainer)
