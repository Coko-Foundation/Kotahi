import React, { useContext } from 'react'
import styled from 'styled-components'
import { compose } from 'recompose'
// import { graphql } from '@apollo/react-hoc'
import { useQuery, useApolloClient } from '@apollo/react-hooks'

import { withRouter, matchPath, Router } from 'react-router-dom'

import { Action } from '@pubsweet/ui'
import { grid } from '@pubsweet/ui-toolkit'
import { JournalContext } from './xpub-journal'
import { XpubContext } from './xpub-with-context'
import GlobalStyle from '../theme/elements/GlobalStyle'

import queries from '../graphql/'

import Menu from './Menu'

const getParams = routerPath => {
  const path = '/journals/:journal/versions/:version'
  return matchPath(routerPath, path).params
}

const Root = styled.div`
  display: grid;
  grid-template-columns: 200px auto;
  grid-template-areas: 'menu main';
  max-height: 100vh;
  height: 100%;
  overflow: hidden;
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

const App = ({ authorized, children, history, match }) => {
  const client = useApolloClient()
  const logoutUser = () => {
    localStorage.removeItem('token')
    client.resetStore()
  }

  const journal = useContext(JournalContext)
  const [conversion] = useContext(XpubContext)

  const { data } = useQuery(queries.currentUser)
  const currentUser = data && data.currentUser

  const { pathname } = history.location
  const showLinks = pathname.match(/submit|manuscript/g)
  let links = []
  const formBuilderLink = `/admin/form-builder`
  const profileLink = `/profile`

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

  links.push(
    <Action
      active={window.location.pathname === profileLink ? 'active' : null}
      to={profileLink}
    >
      Profile
    </Action>,
  )

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
      <GlobalStyle />
      <Menu
        brand={journal.metadata.name}
        brandLink="/dashboard"
        loginLink="/login?next=/dashboard"
        navLinkComponents={links}
        onLogoutClick={() => logoutUser(client)}
        user={currentUser}
      />
      <Router history={history}>{children}</Router>
    </Root>
  )
}

export default compose(withRouter)(App)
