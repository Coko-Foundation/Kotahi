import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getUser } from 'pubsweet-client/src/actions/users'

class Role extends React.Component {
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
    const { label, user } = this.props

    if (!user) return null

    return (
      <div style={{ display: 'table-row' }}>
        <div style={{ display: 'table-cell', padding: '2px 5px 2px 15px', color: '#4990E2' }}>
          {label}
        </div>
        <div style={{ display: 'table-cell', padding: '2px 5px' }}>
          {user.name || user.username}
        </div>
      </div>
    )
  }
}

Role.propTypes = {
  getUser: PropTypes.func.isRequired,
  role: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  user: PropTypes.object
}

export default connect(
  (state, ownProps) => ({
    user: console.log(ownProps) && ownProps.role.user.id ? state.users.users.find(user => user.id === ownProps.role.user.id) : ownProps.role.user
  }),
  {
    getUser
  }
)(Role)
