import React from 'react'
import PropTypes from 'prop-types'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const EditorList = ({ project, roles }) => (
  <ListGroup style={{ marginTop: 20 }}>
    {Object.keys(roles).map(id => {
      const role = roles[id]

      return (
        <LinkContainer key={id} to={`/projects/${project.id}/roles/editor/${id}`} style={{ textDecoration: 'none' }}>
          <ListGroupItem header={role.user.name} className="clearfix">
            <span style={{ float: 'right' }}>{role.status || 'Pending'}</span>
          </ListGroupItem>
        </LinkContainer>
      )
    })}
  </ListGroup>
)

EditorList.propTypes = {
  project: PropTypes.object.isRequired,
  roles: PropTypes.object.isRequired
}

export default EditorList
