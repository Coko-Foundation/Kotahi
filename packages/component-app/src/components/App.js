import React from 'react'
import { compose } from 'recompose'
import { AppBar } from 'xpub-ui'
import { withJournal } from './JournalProvider'
import classes from './App.local.css'

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
  withJournal
)(App)
