import React, { useContext, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { compose } from 'recompose'
import { useQuery } from '@apollo/client'
import {
  withRouter,
  matchPath,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
// import { Action } from '@pubsweet/ui'
import { JournalContext } from './xpub-journal/src'
import { XpubContext } from './xpub-with-context/src'

import UsersManager from '../components/component-users-manager/src/UsersManager'
import Manuscripts from '../components/component-manuscripts/src/Manuscripts'
import Dashboard from '../components/component-dashboard/src/components/Dashboard'
import SubmitPage from '../components/component-submit/src/components/SubmitPage'
import ManuscriptPage from '../components/component-manuscript/src/components/ManuscriptPage'
import ReviewersPage from '../components/component-review/src/components/ReviewersPage'
import ReviewPage from '../components/component-review/src/components/ReviewPage'
import TeamPage from '../components/component-teams-manager/src/components/TeamsManagerPage'
import DecisionPage from '../components/component-review/src/components/DecisionPage'
import FormBuilderPage from '../components/component-formbuilder/src/components/FormBuilderPage'
import NewSubmissionPage from '../components/component-submit/src/components/NewSubmissionPage'
import { Profile } from '../components/component-profile/src'

import { GET_CURRENT_USER } from '../queries'

import Menu from './Menu'
import { Spinner } from './shared'

import currentRolesVar from '../shared/currentRolesVar'

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

// TODO: Redirect if token expires
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      localStorage.getItem('token') ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login?next=/journal/dashboard" />
      )
    }
  />
)

const updateStuff = data => {
  if (data?.currentUser) {
    return currentRolesVar(data.currentUser._currentRoles)
  }
}

const AdminPage = ({ children, history, match }) => {
  const journal = useContext(JournalContext)
  const [conversion] = useContext(XpubContext)

  // Get the current user every 5 seconds (this includes authorization info)
  const { loading, error, data } = useQuery(GET_CURRENT_USER, {
    pollInterval: 5000,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    // TODO: useCallback used because of bug: https://github.com/apollographql/apollo-client/issues/6301
    onCompleted: useCallback(data => updateStuff(data), []),
  })

  const previousDataRef = useRef(null)

  // Do this to prevent polling-related flicker
  if (loading && !previousDataRef.current) {
    return <Spinner />
  }

  let notice = ''
  if (error) {
    if (error.networkError) {
      notice = 'You are offline.'
    } else {
      return <Redirect to="/login" />
    }
  }

  const currentUser = data && data.currentUser

  previousDataRef.current = data

  const { pathname } = history.location
  const showLinks = pathname.match(/^\/(submit|manuscript)/g)
  let links = []
  const formBuilderLink = `/journal/admin/form-builder`
  const homeLink = '/journal/dashboard'

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
    links.push({ link: homeLink, name: 'Dashboard', icon: 'home' })
  }

  if (currentUser && currentUser.admin) {
    // links.push({ link: '/journal/admin/teams', name: 'Teams', icon: 'grid' })
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
      <Menu
        brand={journal.metadata.name}
        brandLink="/journal/dashboard"
        loginLink="/login?next=/journal/dashboard"
        navLinkComponents={links}
        notice={notice}
        user={currentUser}
      />
      <Switch>
        <PrivateRoute component={Dashboard} exact path="/journal/dashboard" />

        <PrivateRoute
          component={NewSubmissionPage}
          exact
          path="/journal/newSubmission"
        />
        <PrivateRoute
          component={SubmitPage}
          exact
          path="/journal/versions/:version/submit"
        />
        <PrivateRoute component={TeamPage} exact path="/journal/admin/teams" />
        <PrivateRoute
          component={FormBuilderPage}
          exact
          path="/journal/admin/form-builder"
        />
        <PrivateRoute
          component={ManuscriptPage}
          exact
          path="/journal/versions/:version/manuscript"
        />
        <PrivateRoute
          component={ReviewersPage}
          exact
          path="/journal/versions/:version/reviewers"
        />
        <PrivateRoute
          component={ReviewPage}
          exact
          path="/journal/versions/:version/reviews/:review"
        />
        <PrivateRoute
          component={DecisionPage}
          exact
          path="/journal/versions/:version/decisions/:decision"
        />
        <PrivateRoute component={Profile} exact path="/journal/profile" />
        <PrivateRoute component={UsersManager} path="/journal/admin/users" />
        <PrivateRoute
          component={Manuscripts}
          path="/journal/admin/manuscripts"
        />
      </Switch>
      {/* <Router history={history}>{children}</Router> */}
    </Root>
  )
}

export default compose(withRouter)(AdminPage)
