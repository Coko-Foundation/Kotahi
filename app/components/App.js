import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter, matchPath } from 'react-router-dom'
// import PropTypes from 'prop-types'

import { AppBar, Link } from '@pubsweet/ui'
import { withJournal } from 'xpub-journal'
import actions from 'pubsweet-client/src/actions'

const getParams = routerPath => {
  const path = '/projects/:project/versions/:version'
  return matchPath(routerPath, path).params
}

const App = ({
  children,
  currentUser,
  journal,
  logoutUser,
  history,
  match,
}) => {
  const { pathname } = history.location
  const showLinks = pathname.match(/submit|manuscript/g)
  let links

  if (showLinks) {
    const params = getParams(pathname)
    const baseLink = `/projects/${params.project}/versions/${params.version}`
    const submitLink = `${baseLink}/submit`
    const manuscriptLink = `${baseLink}/manuscript`

    links = showLinks
      ? [
          <Link key="submission" to={submitLink}>
            Summary Info
          </Link>,
          <Link key="manuscript" to={manuscriptLink}>
            Manuscript
          </Link>,
        ]
      : null
  }

  return (
    <div>
      <AppBar
        brand={journal.metadata.name}
        navLinkComponents={links}
        onLogoutClick={logoutUser}
        user={currentUser}
      />

      <div>{children}</div>
    </div>
  )
}

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser.user,
    }),
    { logoutUser: actions.logoutUser },
  ),
  withJournal,
  withRouter,
)(App)
