import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import ReviewersForm from '../components/ReviewersForm'
import ReviewersList from '../components/ReviewersList'
import { selectCollection } from '../lib/selectors'

class ReviewersContainer extends React.Component {
  render () {
    const { project, updateCollection } = this.props

    if (!project) return null

    const { roles } = project

    // TODO: only return reviewer details from the server to authorised users
    // TODO: implement role status (+ invitations property?)

    return (
      <div>
        <h1 className="content-text">Reviewers</h1>

        <ReviewersForm project={project} updateCollection={updateCollection}/>

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
    project: selectCollection(state, ownProps.params.project)
  }),
  {
    updateCollection
  }
)(ReviewersContainer)
