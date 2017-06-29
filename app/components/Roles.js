import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Role from './Role'

const Roles = ({ project: { id, status, roles } }) => (
  <div>
    <div style={{ display: 'table', margin: 10, borderLeft: '1px solid #ddd' }}>
      {roles.owner.map((role, key) => (
        <Role key={key} label="Owner" role={role}/>
      ))}

      {roles.reviewer && (
        Object.keys(roles.reviewer).map(key => {
          const role = roles.reviewer[key]

          return (
            <Role key={key} label="Reviewer" role={role}/>
          )
        })
      )}
    </div>

    {status === 'submitted' && (
      <div style={{margin: 10}}>
        <Link to={`/projects/${id}/reviewers`}>Invite reviewers</Link>
      </div>
    )}
  </div>
)

Roles.propTypes = {
  project: PropTypes.object.isRequired
}

export default connect()(Roles)
