import React from 'react'
import PropTypes from 'prop-types'
import UpdateSubscriber from 'pubsweet-client/src/components/UpdateSubscriber'
import { connect } from 'react-redux'
import { logoutUser } from 'pubsweet-component-login/actions'
import Navigation from '../components/Navigation'

const NavigationContainer = ({ logoutUser, currentUser }) => (
  <Navigation appName="xpub" // TODO: make configurable
              appLink="/projects" // TODO: make configurable
              currentUser={currentUser}
              logout={logoutUser}
              updateSubscriber={UpdateSubscriber}/>
)

NavigationContainer.propTypes = {
  currentUser: PropTypes.object,
  logoutUser: PropTypes.func.isRequired
}

export default connect(
  state => ({
    currentUser: state.currentUser.isAuthenticated ? state.currentUser.user : null
  }),
  {
    logoutUser
  }
)(NavigationContainer)
