import React, { useContext } from 'react'
import styled from 'styled-components'
import { compose } from 'recompose'
import { useQuery, useApolloClient } from '@apollo/react-hooks'
import { withRouter, matchPath, Router } from 'react-router-dom'
import { Action } from '@pubsweet/ui'
import { JournalContext } from './xpub-journal/src'
import { XpubContext } from './xpub-with-context/src'
import GlobalStyle from '../theme/elements/GlobalStyle'

import queries from '../graphql'

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
  height: 100vh;
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

const NavLink = ({ link, name }) => (
  <Action
    active={window.location.pathname === link ? 'active' : null}
    to={link}
  >
    {name}
  </Action>
)

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
  const showLinks = pathname.match(/^\/(submit|manuscript)/g)
  let links = []
  const formBuilderLink = `/admin/form-builder`
  const profileLink = `/profile`
  const dashboardLink = '/dashboard'

  if (showLinks) {
    const params = getParams(pathname)
    const baseLink = `/journals/${params.journal}/versions/${params.version}`
    const submitLink = `${baseLink}/submit`
    const manuscriptLink = `${baseLink}/manuscript`

    links = showLinks
      ? [
          NavLink({ link: submitLink, name: 'Summary Info' }),
          NavLink({ link: manuscriptLink, name: 'Manuscript' }),
        ]
      : null
  }

  links.push(NavLink({ link: dashboardLink, name: 'Dashboard' }))
  links.push(NavLink({ link: profileLink, name: 'Profile' }))

  if (currentUser && currentUser.admin) {
    links.push(NavLink({ link: '/teams', name: 'Teams' }))
    links.push(NavLink({ link: formBuilderLink, name: 'Forms' }))
    links.push(NavLink({ link: '/admin/users', name: 'Users' }))
    links.push(NavLink({ link: '/admin/manuscripts', name: 'Manuscripts' }))
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
