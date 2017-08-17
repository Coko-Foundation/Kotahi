import React from 'react'
import PropTypes from 'prop-types'
import { compose, withContext } from 'recompose'
import { connect } from 'react-redux'
import { AppBar } from 'xpub-ui'
import { selectCurrentUser } from 'xpub-selectors'
import { actions } from 'pubsweet-client'
import classes from './App.local.css'
import * as journal from '../config/journal'

// NOTE: currently loading all collections and fragments into the store on startup!
// TODO: dispatch loading actions from components, via HOC

class App extends React.Component  {
  componentDidMount () {
    const { getProjects, getVersions } = this.props

    getProjects().then(({ collections: projects }) => {
      projects.forEach(project => getVersions(project))
    })
  }

  render () {
    const { children, currentUser } = this.props

    return (
      <div className={classes.root}>
        <AppBar
          appName={journal.metadata.name}
          appLink="/projects" // TODO: make configurable
          userName={currentUser ? currentUser.username : null}
          loginLink="/signin"
          logoutLink="/signout"/>

        <div className={classes.main}>
          {children}
        </div>
      </div>
    )
  }
}

/*const App = ({ children, currentUser }) => (
  <div className={classes.root}>
    <AppBar
      appName={journal.metadata.name}
      appLink="/projects" // TODO: make configurable
      userName={currentUser ? currentUser.username : null}
      loginLink="/signin"
      logoutLink="/signout"/>

    <div className={classes.main}>
      {children}
    </div>
  </div>
)*/

App.propTypes = {
  children: PropTypes.node,
  currentUser: PropTypes.object
}

export default compose(
  connect(
    state => ({
      currentUser: selectCurrentUser(state)
    }),
    {
      getProjects: actions.getCollections,
      getVersions: actions.getFragments
    }
  ),
  withContext(
    { journal: PropTypes.object },
    () => ({ journal })
  ),
)(App)
