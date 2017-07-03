import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import ReviewersForm from '../components/ReviewersForm'
import ReviewersList from '../components/ReviewersList'

class ReviewersContainer extends React.Component {
  render () {
    const { project, updateCollection } = this.props

    if (!project) return null

    const { roles } = project

    // TODO: only return reviewer details from the server to authorised users
    // TODO: implement role status (+ invitations property?)

    return (
      <div className="content-metadata">
        <h1>Reviewers</h1>

        <div className="content-interactive">
          <ReviewersForm project={project} updateCollection={updateCollection}/>
        </div>

        {roles.reviewer && (
          <ReviewersList project={project} roles={roles.reviewer}
                         style={{ marginTop: 20 }}/>
        )}
      </div>
    )
  }
}

ReviewersContainer.propTypes = {
  params: PropTypes.object.isRequired,
  project: PropTypes.object,
  updateCollection: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    // FIXME: not updating
    project: state.collections.find(collection => {
      return collection.id === ownProps.params.project
    })
  }),
  {
    updateCollection
  }
)(ReviewersContainer)
