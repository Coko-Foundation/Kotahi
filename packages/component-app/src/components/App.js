import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
// import PropTypes from 'prop-types'

import { AppBar } from '@pubsweet/ui'
import { withJournal } from 'xpub-journal'
import 'xpub-bootstrap'
import actions from 'pubsweet-client/src/actions'

const App = ({ children, currentUser, journal, logoutUser }) => (
  <div>
    <AppBar
      brand={journal.metadata.name}
      onLogoutClick={logoutUser}
      user={currentUser}
    />

    <div>{children}</div>
  </div>
)

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser.user,
    }),
    { logoutUser: actions.logoutUser },
  ),
  withJournal,
)(App)
