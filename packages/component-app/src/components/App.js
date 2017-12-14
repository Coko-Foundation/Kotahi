import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
// import PropTypes from 'prop-types'

import { AppBar } from '@pubsweet/ui'
import { withJournal } from 'xpub-journal'
import 'xpub-bootstrap'

import classes from './App.local.scss'

const App = ({ children, currentUser, journal }) => (
  <div className={classes.root}>
    <AppBar
      brandLink="/"
      brandName={journal.metadata.name}
      loginLink="/login"
      logoutLink="/logout"
      userName={currentUser ? currentUser.username : null}
    />

    <div className={classes.main}>{children}</div>
  </div>
)

export default compose(
  connect(state => ({
    currentUser: state.currentUser.user,
  })),
  withJournal,
)(App)
