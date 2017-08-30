import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { logout } from '../redux/logout'

class Logout extends React.Component {
  componentDidMount () {
    const { isAuthenticated, logout } = this.props

    if (isAuthenticated)  {
      logout()
    }
  }

  render () {
    const { isAuthenticated } = this.props

    return isAuthenticated ? <div>Signing out…</div> : <div>Signed out</div>
  }
}

export default compose(
  connect(
    state => ({
      isAuthenticated: state.currentUser.isAuthenticated,
    }),
    {
      logout
    }
  )
)(Logout)
