import React, { useContext } from 'react'
import styled from 'styled-components'
import { compose, withProps } from 'recompose'
import { graphql } from '@apollo/react-hoc'

import { withRouter, matchPath, Router } from 'react-router-dom'

import { Action, AppBar } from '@pubsweet/ui'
import { JournalContext } from 'xpub-journal'
import { XpubContext } from 'xpub-with-context'

import queries from '../graphql/'

const getParams = routerPath => {
  const path = '/journals/:journal/versions/:version'
  return matchPath(routerPath, path).params
}

const MainPage = styled.div`
  margin-top: 20px;
`

const Root = styled.div`
  ${({ converting }) =>
    converting &&
    `
     button,
     a {
       pointer-events: none;
     }
  `};
`

const localStorage = window.localStorage || undefined

const App = ({
  authorized,
  children,
  client,
  currentUser,
  logoutUser,
  history,
  match,
}) => {
  const journal = useContext(JournalContext)
  const [conversion] = useContext(XpubContext)

  const { pathname } = history.location
  const showLinks = pathname.match(/submit|manuscript/g)
  let links = []
  const formBuilderLink = `/admin/form-builder`

  if (showLinks) {
    const params = getParams(pathname)
    const baseLink = `/journals/${params.journal}/versions/${params.version}`
    const submitLink = `${baseLink}/submit`
    const manuscriptLink = `${baseLink}/manuscript`

    links = showLinks
      ? [
          <Action
            active={window.location.pathname === submitLink ? 'active' : null}
            to={submitLink}
          >
            Summary Info
          </Action>,
          <Action
            active={
              window.location.pathname === manuscriptLink ? 'active' : null
            }
            to={manuscriptLink}
          >
            Manuscript
          </Action>,
        ]
      : null
  }

  if (currentUser && currentUser.admin) {
    links.push(
      <Action
        active={window.location.pathname === '/teams' ? 'active' : null}
        to="/teams"
      >
        Team Manager
      </Action>,
    )

    links.push(
      <Action
        active={window.location.pathname === formBuilderLink ? 'active' : null}
        to={formBuilderLink}
      >
        Form Builder
      </Action>,
    )
  }

  return (
    <Root converting={conversion.converting}>
      <AppBar
        brand={journal.metadata.name}
        navLinkComponents={links}
        onLogoutClick={() => logoutUser(client)}
        user={currentUser}
      />
      <Router history={history}>
        <MainPage>{children}</MainPage>
      </Router>
    </Root>
  )
}

export default compose(
  graphql(queries.currentUser, {
    props: ({ data }) => data,
    // eslint-disable-next-line
    skip: () => (localStorage.getItem('token') ? false : true),
  }),
  withProps(props => ({
    logoutUser: client => {
      localStorage.removeItem('token')
      client.resetStore()
    },
  })),
  withRouter,
)(App)
