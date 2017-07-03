import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { fileUpload } from 'pubsweet-client/src/actions/fileUpload'
import { getCollection } from 'pubsweet-client/src/actions/collections'
import { getFragment, updateFragment } from 'pubsweet-client/src/actions/fragments'
import SimpleEditor from 'pubsweet-component-wax/src/SimpleEditor'

const fullscreenStyle = {
  position: 'fixed',
  top: 50, // leave room for the navbar
  left: 0,
  right: 0,
  bottom: 0,
  background: 'white',
  overflow: 'hidden'
}

class WaxContainer extends React.Component {
  componentDidMount () {
    const { getCollection, getFragment, params } = this.props

    getCollection({ id: params.project })
    getFragment({ id: params.project }, { id: params.snapshot })
  }

  render () {
    const { project, snapshot, fileUpload, updateFragment, currentUser } = this.props

    if (!snapshot || !project) return null

    return (
      <SimpleEditor
        book={project}
        fileUpload={fileUpload}
        fragment={snapshot}
        history={browserHistory}
        onSave={({ source }) => updateFragment(project, { id: snapshot.id, source })}
        update={data => updateFragment(project, { id: snapshot.id, ...data })}
        user={currentUser}
        style={fullscreenStyle}
      />
    )
  }
}

WaxContainer.propTypes = {
  fileUpload: PropTypes.func.isRequired,
  getCollection: PropTypes.func.isRequired,
  getFragment: PropTypes.func.isRequired,
  updateFragment: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  params: PropTypes.object.isRequired,
  project: PropTypes.object,
  snapshot: PropTypes.object
}

export default connect(
  (state, ownProps) => ({
    currentUser: state.currentUser.isAuthenticated ? state.currentUser.user : null,
    project: state.collections.find(collection => collection.id === ownProps.params.project),
    snapshot: state.fragments[ownProps.params.snapshot]
  }),
  {
    fileUpload,
    getCollection,
    getFragment,
    updateFragment
  }
)(WaxContainer)
