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

const getParams = ({ routerPath, path }) => {
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
const PrivateRoute = ({ component: Component, redirectLink, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      localStorage.getItem('token') ? (
        <Component {...props} />
      ) : (
        <Redirect to={redirectLink} />
      )
    }
  />
)

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  redirectLink: PropTypes.string.isRequired,
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

  const urlFrag = journal.metadata.toplevel_urlfragment
  const { pathname } = history.location
  const showLinks = pathname.match(/^\/(submit|manuscript)/g)
  let links = []
  const formBuilderLink = `${urlFrag}/admin/form-builder`
  const homeLink = `${urlFrag}/dashboard`
  const profileLink = `${urlFrag}/profile`
  const loginLink = `/login?next=${homeLink}`
  const path = `${urlFrag}/versions/:version`
  const redirectLink = `/login?next=${homeLink}`

  if (showLinks) {
    const params = getParams(pathname, path)
    const baseLink = `${urlFrag}/versions/${params.version}`
    const submitLink = `${baseLink}/submit`
    const manuscriptLink = `${baseLink}/manuscript`

    links = showLinks
      ? [
          { link: submitLink, name: 'Summary Info' },
          { link: manuscriptLink, name: 'Manuscript' },
        ]
      : null
  }

  if (
    currentUser &&
    ['aperture', 'colab'].includes(process.env.INSTANCE_NAME)
  ) {
    links.push({ link: homeLink, name: 'Dashboard', icon: 'home' })
  }

  if (currentUser && currentUser.admin) {
    links.push({ link: formBuilderLink, name: 'Forms', icon: 'check-square' })
    links.push({ link: `${urlFrag}/admin/users`, name: 'Users', icon: 'users' })
    links.push({
      link: `${urlFrag}/admin/manuscripts`,
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
        brandLink={homeLink}
        className=""
        loginLink={loginLink}
        navLinkComponents={links}
        notice={notice}
        profileLink={profileLink}
        user={currentUser}
      />
      <Switch>
        <PrivateRoute
          component={Dashboard}
          exact
          path={homeLink}
          redirectLink={redirectLink}
        />

        <PrivateRoute
          component={NewSubmissionPage}
          exact
          path={`${urlFrag}/newSubmission`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={SubmitPage}
          exact
          path={`${urlFrag}/versions/:version/submit`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={FormBuilderPage}
          exact
          path={`${urlFrag}/admin/form-builder`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={ManuscriptPage}
          exact
          path={`${urlFrag}/versions/:version/manuscript`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={ReviewersPage}
          exact
          path={`${urlFrag}/versions/:version/reviewers`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={ReviewPage}
          exact
          path={`${urlFrag}/versions/:version/review`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={DecisionPage}
          exact
          path={`${urlFrag}/versions/:version/decision`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={Profile}
          exact
          path={`${urlFrag}/profile`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={UsersManager}
          path={`${urlFrag}/admin/users`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={Manuscripts}
          path={`${urlFrag}/admin/manuscripts`}
          redirectLink={redirectLink}
        />
        {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) && (
          <PrivateRoute
            component={SubmitPage}
            exact
            path={`${urlFrag}/versions/:version/evaluation`}
            redirectLink={redirectLink}
          />
        )}
      </Switch>
      <RolesUpdater />
    </Root>
  )
}

export default AdminPage
