import React from 'react'
import PropTypes from 'prop-types'
import RolesSummaryItemContainer from '../containers/RolesSummaryItemContainer'

const roleTypes = ['owner', 'editor', 'reviewer']

const RolesSummary = ({ project }) => (
  <div className="content-metadata" style={{ display: 'table', margin: 10, borderLeft: '1px solid #ddd' }}>

    {roleTypes.map(roleType => {
      const roles = project.roles[roleType]

      if (!roles) return null

      return Object.keys(roles).map(id => {
        const role = roles[id]

        return (
          <RolesSummaryItemContainer key={id} roleId={id} roleType={roleType} project={project} role={role}/>
        )
      })
    })}
  </div>
)

RolesSummary.propTypes = {
  project: PropTypes.object.isRequired
}

export default RolesSummary
