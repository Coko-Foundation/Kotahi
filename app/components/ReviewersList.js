import React from 'react'
import PropTypes from 'prop-types'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const ReviewersList = ({ project, roles }) => (
  <ListGroup>
    {Object.keys(roles).map(id => {
      const role = roles[id]

      return (
        <LinkContainer key={id} to={`/projects/${project.id}/roles/reviewer/${id}`}
                       style={{ textDecoration: 'none' }}>
          <ListGroupItem header={role.user.name} className="clearfix">
            <span>{role.user.email}</span>
            <span style={{ float: 'right' }}>{role.status || 'Pending'}</span>
          </ListGroupItem>
        </LinkContainer>
      )
    })}
  </ListGroup>
)

ReviewersList.propTypes = {
  project: PropTypes.object,
  roles: PropTypes.object.isRequired
}

export default ReviewersList
