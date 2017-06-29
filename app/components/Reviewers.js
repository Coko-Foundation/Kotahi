import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import FRC from 'formsy-react-components'
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import uuid from 'uuid'
import { LinkContainer } from 'react-router-bootstrap'

class Reviewers extends React.Component {
  addReviewer = user => {
    const { project, updateCollection } = this.props

    const { roles } = project
    roles.reviewer = roles.reviewer || {}
    roles.reviewer[uuid()] = { user }

    updateCollection({
      id: project.id,
      roles
    })

    this.reviewerForm.reset()
  }

  render () {
    const { project } = this.props

    if (!project) return null

    const { roles } = project

    // TODO: only return reviewer details from the server to authorised users
    // TODO: implement role status (+ invitations property?)

    return (
      <div className="content-metadata">
        <h1>Reviewers</h1>

        <div className="content-interactive">
          <FRC.Form ref={form => (this.reviewerForm = form)} onSubmit={this.addReviewer} validateOnSubmit={true}
                    layout="vertical">
            <div>
              <FRC.Input type="text" name="name" label="Reviewer name"/>
            </div>

            <div>
              <FRC.Input type="email" name="email" label="Reviewer email"/>
            </div>

            <div style={{ marginTop: 20 }}>
              <Button type="submit" bsStyle="primary">Save</Button>
            </div>
          </FRC.Form>
        </div>

        {roles.reviewer && (
          <ListGroup style={{marginTop: 20}}>
            {Object.keys(roles.reviewer).map(key => {
              const role = roles.reviewer[key]

              // TODO: use role.id instead of key

              return (
                <LinkContainer key={key} to={`/projects/${project.id}/roles/reviewer/${key}`} style={{textDecoration: 'none'}}>
                  <ListGroupItem header={role.user.name} className="clearfix">
                    <span>{role.user.email}</span>
                    <span style={{float: 'right'}}>{role.status || 'Pending'}</span>
                  </ListGroupItem>
                </LinkContainer>
              )
            })}
          </ListGroup>
        )}
      </div>
    )
  }
}

Reviewers.propTypes = {
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
)(Reviewers)
