import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import RolesSummaryItem from './RolesSummaryItem'

const roleTypes = ['owner', 'editor', 'reviewer']

const RolesSummary = ({ project }) => (
  <div>
    <div style={{ display: 'table', margin: 10, borderLeft: '1px solid #ddd' }}>

      {roleTypes.map(roleType => {
        const roles = project.roles[roleType]

        if (!roles) return null

        return Object.keys(roles).map(id => {
          const role = roles[id]

          return (
            <RolesSummaryItem key={id} roleId={id} roleType={roleType} project={project} role={role}/>
          )
        })
      })}

    </div>
  </div>
)

RolesSummary.propTypes = {
  project: PropTypes.object.isRequired
}

export default connect()(RolesSummary)
