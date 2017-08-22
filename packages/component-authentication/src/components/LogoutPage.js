import React from 'react'
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

export default compose(
  connect(
    state => ({
      isAuthenticated: state.currentUser.isAuthenticated,
    }),
    {
      logoutUser
    }
  )
)(Logout)
