import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

const RolesSummaryItem = ({ label, url, user }) => (
  <div style={{ display: 'table-row' }}>
    <div style={{ display: 'table-cell', padding: '2px 5px 2px 15px', color: '#4990E2' }}>
      {label}
    </div>
    <div style={{ display: 'table-cell', padding: '2px 5px' }}>
      <Link to={url}>
        {user.name || user.username}
      </Link>
    </div>
  </div>
)

RolesSummaryItem.propTypes = {
  label: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
}

export default RolesSummaryItem
