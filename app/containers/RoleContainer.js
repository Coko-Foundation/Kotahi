import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ucfirst } from '../lib/text'
import ReviewerInvitationForm from '../components/ReviewerInvitationForm'
import DecisionForm from '../components/DecisionForm'
import ReviewForm from '../components/ReviewForm'

class RoleContainer extends React.Component {
  render () {
    const { role, roleType } = this.props

    return (
      <div>
        <h1>{ucfirst(roleType)}: {role.user.name || role.user.username}</h1>

        {roleType === 'reviewer' && (
          <div className="content-interactive">
            <ReviewerInvitationForm role={role} onSubmit={inviteReviewer}/>
            <ReviewForm role={role} onSubmit={submitReview}/>
          </div>
          )}

        {roleType === 'editor' && (
          <div className="content-interactive">
            <DecisionForm role={role} onSubmit={submitDecision}/>
          </div>
        )}
      </div>
    )
  }
}

RoleContainer.propTypes = {
  project: PropTypes.object,
  role: PropTypes.object,
  roleType: PropTypes.string.isRequired
}

export default connect(
  (state, ownProps) => {
    const project = state.collections.find(collection => {
      return collection.id === ownProps.params.project
    })

    const { roleType } = ownProps.params

    const role = project.roles[roleType][ownProps.params.role]

    return { project, role, roleType }
  }
)(RoleContainer)
