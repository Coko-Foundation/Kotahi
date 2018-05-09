import React from 'react'
import styled from 'styled-components'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter, matchPath } from 'react-router-dom'
// import PropTypes from 'prop-types'

import { Action, AppBar } from '@pubsweet/ui'
import { withJournal } from 'xpub-journal'
import actions from 'pubsweet-client/src/actions'

const getParams = routerPath => {
  const path = '/projects/:project/versions/:version'
  return matchPath(routerPath, path).params
}

const Root = styled.div`
  ${({ disableLinks }) =>
    disableLinks &&
    `
     button,
     a {
       pointer-events: none;
     }
  `};
`

const App = ({
  children,
  currentUser,
  journal,
  logoutUser,
  history,
  match,
  disableLinks,
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
          <Action
            active={window.location.pathname === submitLink}
            to={submitLink}
          >
            Summary Info
          </Action>,
          <Action
            active={window.location.pathname === manuscriptLink}
            to={manuscriptLink}
          >
            Manuscript
          </Action>,
        ]
      : null
  }

  return (
    <Root disableLinks={disableLinks}>
      <AppBar
        brand={journal.metadata.name}
        navLinkComponents={links}
        onLogoutClick={logoutUser}
        user={currentUser}
      />

      <div>{children}</div>
    </Root>
  )
}

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser.user,
      disableLinks: state.conversion.converting,
    }),
    { logoutUser: actions.logoutUser },
  ),
  withJournal,
  withRouter,
)(App)
