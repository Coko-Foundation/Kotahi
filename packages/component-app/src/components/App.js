import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { AppBar } from 'xpub-ui'
import { withJournal } from './JournalProvider'
import classes from './App.local.scss'

const App = ({ children, currentUser, journal }) => (
  <div className={classes.root}>
    <AppBar
      brandName={journal.metadata.name}
      brandLink="/"
      userName={currentUser ? currentUser.username : null}
      loginLink="/login"
      logoutLink="/logout"/>

    <div className={classes.main}>
      {children}
    </div>
  </div>
)

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser.user
    })
  ),
  withJournal
)(App)
