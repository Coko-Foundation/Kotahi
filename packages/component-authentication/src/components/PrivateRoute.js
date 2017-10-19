import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { Route, Redirect, withRouter } from 'react-router-dom'
import { getCurrentUser } from '../redux/currentUser'

const PrivateRoute = ({ currentUser, getCurrentUser, component: Component, ...rest }) => (
  <Route {...rest} render={props => {
    if (!currentUser.isFetched) {
      if (!currentUser.isFetching) {
        getCurrentUser()
      }

      return <div>loading…</div>
    }

    if (!currentUser.isAuthenticated) {
      return (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }}/>
      )
    }

    return <Component {...props}/>
  }}/>
)

export default compose(
  withRouter,
  connect(
    state => ({
      currentUser: state.currentUser,
    }),
    {
      getCurrentUser
    }
  )
)(PrivateRoute)
