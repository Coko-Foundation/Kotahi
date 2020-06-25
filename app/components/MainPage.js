import React, { useContext } from 'react'
import styled from 'styled-components'
import { compose } from 'recompose'
import { useQuery, useApolloClient } from '@apollo/react-hooks'
import { withRouter, matchPath, Router } from 'react-router-dom'
// import { Action } from '@pubsweet/ui'
import { JournalContext } from './xpub-journal/src'
import { XpubContext } from './xpub-with-context/src'
import GlobalStyle from '../theme/elements/GlobalStyle'

import queries from '../graphql'

import Menu from './Menu'

const getParams = routerPath => {
  const path = '/journal/versions/:version'
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

const MainPage = ({ children, history, match }) => {
  const client = useApolloClient()

  const journal = useContext(JournalContext)
  const [conversion] = useContext(XpubContext)

  const { data } = useQuery(queries.currentUser)
  const currentUser = data && data.currentUser

  const { pathname } = history.location
  const showLinks = pathname.match(/^\/(submit|manuscript)/g)
  let links = []
  const formBuilderLink = `/journal/admin/form-builder`
  const profileLink = `/journal/profile`
  const homeLink = '/journal/home'

  if (showLinks) {
    const params = getParams(pathname)
    const baseLink = `/journal/versions/${params.version}`
    const submitLink = `${baseLink}/submit`
    const manuscriptLink = `${baseLink}/manuscript`

    links = showLinks
      ? [
          { link: submitLink, name: 'Summary Info' },
          { link: manuscriptLink, name: 'Manuscript' },
        ]
      : null
  }

  if (currentUser) {
    links.push({ link: homeLink, name: 'Home', icon: 'home' })
  }

  if (currentUser && currentUser.admin) {
    links.push({ link: '/journal/admin/teams', name: 'Teams', icon: 'grid' })
    links.push({ link: formBuilderLink, name: 'Forms', icon: 'check-square' })
    links.push({ link: '/journal/admin/users', name: 'Users', icon: 'users' })
    links.push({
      link: '/journal/admin/manuscripts',
      name: 'Manuscripts',
      icon: 'file-text',
    })
  }

  return (
    <Root converting={conversion.converting}>
      <GlobalStyle />
      <Menu
        brand={journal.metadata.name}
        brandLink="/journal/home"
        loginLink="/login?next=/journal/home"
        navLinkComponents={links}
        user={currentUser}
      />
      <Router history={history}>{children}</Router>
    </Root>
  )
}

export default compose(withRouter)(MainPage)
