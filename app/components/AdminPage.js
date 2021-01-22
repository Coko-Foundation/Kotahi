import React, { useContext, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/client'
import {
  useHistory,
  matchPath,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import PropTypes from 'prop-types'
import { JournalContext } from './xpub-journal/src'
import { XpubContext } from './xpub-with-context/src'

import UsersManager from './component-users-manager/src/UsersManager'
import Manuscripts from './component-manuscripts/src/Manuscripts'
import Dashboard from './component-dashboard/src/components/Dashboard'
import SubmitPage from './component-submit/src/components/SubmitPage'
import ManuscriptPage from './component-manuscript/src/components/ManuscriptPage'
import ReviewersPage from './component-review/src/components/ReviewersPage'
import ReviewPage from './component-review/src/components/ReviewPage'
import DecisionPage from './component-review/src/components/DecisionPage'
import FormBuilderPage from './component-formbuilder/src/components/FormBuilderPage'
import NewSubmissionPage from './component-submit/src/components/NewSubmissionPage'
import { Profile } from './component-profile/src'

import { GET_CURRENT_USER } from '../queries'

import Menu from './Menu'
import { Spinner } from './shared'

import currentRolesVar from '../shared/currentRolesVar'
import RolesUpdater from './RolesUpdater'

const getParams = routerPath => {
  const path = '/journal/versions/:version'
  return matchPath(routerPath, path).params
}

const Root = styled.div`
  display: grid;
  grid-template-areas: 'menu main';
  grid-template-columns: 200px auto;
  height: 100vh;
  max-height: 100vh;
  ${({ converting }) =>
    converting &&
    `
     button,
     a {
       pointer-events: none;
     }
  `};
  overflow: hidden;
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

PrivateRoute.propTypes = {
  component: PropTypes.node.isRequired,
}

const updateStuff = data => {
  if (data?.currentUser) {
    // eslint-disable-next-line no-underscore-dangle
    return currentRolesVar(data.currentUser._currentRoles)
  }

  return false
}

const AdminPage = () => {
  const history = useHistory()
  const journal = useContext(JournalContext)
  const [conversion] = useContext(XpubContext)

  const { loading, error, data } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'network-only',
    // TODO: useCallback used because of bug: https://github.com/apollographql/apollo-client/issues/6301
    onCompleted: useCallback(dataTemp => updateStuff(dataTemp), []),
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
  const profileLink = '/journal/profile'

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

  if (currentUser) {
    links.push({ link: profileLink, name: 'My profile', icon: 'user' })
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
          path="/journal/versions/:version/review"
        />
        <PrivateRoute
          component={DecisionPage}
          exact
          path="/journal/versions/:version/decision"
        />
        <PrivateRoute component={Profile} exact path="/journal/profile" />
        <PrivateRoute component={UsersManager} path="/journal/admin/users" />
        <PrivateRoute
          component={Manuscripts}
          path="/journal/admin/manuscripts"
        />
      </Switch>
      <RolesUpdater />
    </Root>
  )
}

export default AdminPage
