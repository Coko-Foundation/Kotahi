import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import FRC from 'formsy-react-components'
import { Button } from 'react-bootstrap'

const ucfirst = (text) => {
  return text.substr(0, 1).toUpperCase() + text.substr(1)
}

// TODO: display reviews/decisions on each snapshot

const Role = ({ role, params: { roleType } }) => (
  <div>
    <h1>{ucfirst(roleType)}: {role.user.name || role.user.username}</h1>

    {roleType === 'reviewer' && (
      <div className="content-interactive">
        <FRC.Form onSubmit={this.inviteReviewer} validateOnSubmit={true} layout="vertical">
          <div>
            <FRC.Textarea name="invitation" label="Invitation" rows={5}/>
          </div>

          <div style={{ marginTop: 20 }}>
            <Button type="submit" bsStyle="primary" disabled={role.status === 'invited'}>Send invitation</Button>
          </div>
        </FRC.Form>

        <FRC.Form onSubmit={this.submitReview} validateOnSubmit={true} layout="vertical">
          <div>
            <FRC.Textarea name="review" label="Review" rows={5}/>
          </div>

          <div style={{ marginTop: 20 }}>
            <Button type="submit" bsStyle="primary">Submit review</Button>
          </div>
        </FRC.Form>
      </div>
    )}

    {roleType === 'editor' && (
      <div className="content-interactive">
        <FRC.Form onSubmit={this.submitDecision} validateOnSubmit={true} layout="vertical">
          <div>
            <FRC.Textarea name="decision" label="Decision" rows={5}/>
          </div>

          <div style={{ marginTop: 20 }}>
            <Button type="submit" bsStyle="primary">Submit decision</Button>
          </div>
        </FRC.Form>
      </div>
    )}
  </div>
)

Role.propTypes = {
  params: PropTypes.object,
  project: PropTypes.object,
  role: PropTypes.object
}

export default connect(
  (state, ownProps) => {
    const project = state.collections.find(collection => {
      return collection.id === ownProps.params.project
    })

    console.log(project)

    return {
      project,
      role: project.roles[ownProps.params.roleType][ownProps.params.role]
    }
  }
)(Role)
