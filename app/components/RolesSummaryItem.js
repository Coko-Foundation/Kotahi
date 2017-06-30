import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getUser } from 'pubsweet-client/src/actions/users'
import { Link } from 'react-router'

const ucfirst = (text) => {
  return text.substr(0, 1).toUpperCase() + text.substr(1)
}

class RolesSummaryItem extends React.Component {
  componentDidMount () {
    const userId = this.props.role.user.id

    if (userId) {
      this.fetch(userId)
    }
  }

  componentWillReceiveProps (nextProps) {
    const userId = nextProps.role.user.id

    if (userId && userId !== this.props.role.user.id) {
      this.fetch(userId)
    }
  }

  fetch (id) {
    this.props.getUser({ id })
  }

  render () {
    const { project, roleId, roleType, user } = this.props

    if (!user) return null

    return (
      <div style={{ display: 'table-row' }}>
        <div style={{ display: 'table-cell', padding: '2px 5px 2px 15px', color: '#4990E2' }}>
          {ucfirst(roleType)}
        </div>
        <div style={{ display: 'table-cell', padding: '2px 5px' }}>
          <Link to={`/projects/${project.id}/roles/${roleType}/${roleId}`}>
            {user.name || user.username}
          </Link>
        </div>
      </div>
    )
  }
}

RolesSummaryItem.propTypes = {
  getUser: PropTypes.func.isRequired,
  roleId: PropTypes.string.isRequired,
  roleType: PropTypes.string.isRequired,
  project: PropTypes.object.isRequired,
  role: PropTypes.object.isRequired,
  user: PropTypes.object
}

export default connect(
  (state, ownProps) => ({
    user: ownProps.role.user.id ? state.users.users.find(user => user.id === ownProps.role.user.id) : ownProps.role.user
  }),
  {
    getUser
  }
)(RolesSummaryItem)
