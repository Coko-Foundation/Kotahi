import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import RolesSummaryItem from './RolesSummaryItem'

const RolesSummary = ({ project: { id, status, roles } }) => (
  <div>
    <div style={{ display: 'table', margin: 10, borderLeft: '1px solid #ddd' }}>
      {roles.owner.map((role, key) => (
        <RolesSummaryItem key={key} label="Owner" role={role}/>
      ))}

      {roles.reviewer && (
        Object.keys(roles.reviewer).map(key => {
          const role = roles.reviewer[key]

          return (
            <RolesSummaryItem key={key} label="Reviewer" role={role}/>
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

RolesSummary.propTypes = {
  project: PropTypes.object.isRequired
}

export default connect()(RolesSummary)
