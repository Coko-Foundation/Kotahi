import React from 'react'
import PropTypes from 'prop-types'
import UpdateSubscriber from 'pubsweet-client/src/components/UpdateSubscriber'
import { connect } from 'react-redux'
import { logoutUser } from 'pubsweet-component-login/actions'
import Navigation from './Navigation'

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

const selectCurrentUser = (state) => state.currentUser.isAuthenticated
  ? state.currentUser.user
  : null

export default connect(
  state => ({
    currentUser: selectCurrentUser(state)
  }),
  {
    logoutUser
  }
)(NavigationContainer)
