import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { logoutUser } from 'pubsweet-component-login/actions'

class Logout extends React.Component {
  componentDidMount () {
    const { isAuthenticated, logoutUser } = this.props

    if (isAuthenticated)  {
      logoutUser()
    }
  }

  render () {
    const { isAuthenticated } = this.props

    return isAuthenticated ? 'Signed out' : 'Signing out…'
  }
}

Logout.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
}

export default compose(
  connect(
    state => ({
      isAuthenticated: state.currentUser.isAuthenticated,
    }),
    {
      logoutUser
    }
  ),
)(Logout)
