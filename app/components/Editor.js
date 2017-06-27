import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'pubsweet-client/src/actions'
import SimpleEditor from 'pubsweet-component-wax/src/SimpleEditor'

import './Editor.css'

class Editor extends React.Component {
  componentDidMount () {
    const { actions, params } = this.props

    actions.getCollection({
      id: params.project
    })

    actions.getFragment({
      id: params.project
    }, {
      id: params.snapshot
    })
  }

  render () {
    const { project, snapshot, actions, currentUser } = this.props

    if (!snapshot || !project) return null

    return (
      <div className="editor">
        <SimpleEditor
          book={project}
          fileUpload={actions.fileUpload}
          fragment={snapshot}
          history={history}
          onSave={({ source }) => actions.updateFragment(project, { source })}
          update={data => actions.updateFragment(project, data)}
          user={currentUser}
        />
      </div>
    )
  }
}

Editor.propTypes = {
  actions: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  params: PropTypes.object.isRequired,
  project: PropTypes.object,
  snapshot: PropTypes.object
}

export default connect(
  (state, ownProps) => ({
    currentUser: state.currentUser && state.currentUser.isAuthenticated ? state.currentUser.user : null,
    project: state.collections.find(collection => collection.id === ownProps.params.project),
    snapshot: state.fragments[ownProps.params.snapshot]
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })
)(Editor)
