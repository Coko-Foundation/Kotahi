import React, { useContext, useCallback, useRef } from 'react'
import { throttle } from 'lodash'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import {
  useHistory,
  matchPath,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import { JournalContext } from './xpub-journal/src'
import { XpubContext } from './xpub-with-context/src'

import UsersManager from './component-users-manager/src/UsersManager'
import ManuscriptsPage from './component-manuscripts/src/ManuscriptsPage'
import DashboardPage from './component-dashboard/src/components/DashboardPage'
import SubmitPage from './component-submit/src/components/SubmitPage'
import ManuscriptPage from './component-manuscript/src/components/ManuscriptPage'
import ReviewersPage from './component-review/src/components/ReviewersPage'
import ReviewPage from './component-review/src/components/ReviewPage'
import ReviewPreviewPage from './component-review/src/components/ReviewPreviewPage'
import DecisionPage from './component-review/src/components/DecisionPage'
import FormBuilderPage from './component-formbuilder/src/components/FormBuilderPage'
import NewSubmissionPage from './component-submit/src/components/NewSubmissionPage'
import ReportPage from './component-reporting/src/ReportPage'
import { Profile } from './component-profile/src'
import ProductionPage from './component-production/src/components/ProductionPage'

import { GET_CURRENT_USER } from '../queries'

import Menu from './Menu'
import { Spinner } from './shared'

import currentRolesVar from '../shared/currentRolesVar'
import RolesUpdater from './RolesUpdater'

const getParams = ({ routerPath, path }) => {
  return matchPath(routerPath, path).params
}

const CSS_QUERY = gql`
  query getCSSQuery {
    builtCss {
      css
    }
  }
`

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
  position: relative;
  z-index: 0;
`

// TODO: Redirect if token expires
const PrivateRoute = ({ component: Component, redirectLink, ...rest }) => {
  if (
    ['aperture', 'colab'].includes(process.env.INSTANCE_NAME) &&
    rest.currentUser &&
    !rest.currentUser.email
  ) {
    return <Redirect to="/kotahi/profile" />
  }

  return (
    <Route
      {...rest}
      render={props => {
        return localStorage.getItem('token') ? (
          <Component {...rest} {...props} />
        ) : (
          <Redirect to={redirectLink} />
        )
      }}
    />
  )
}

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
  Modal.setAppElement('#root')
  const history = useHistory()
  const journal = useContext(JournalContext)
  const [conversion] = useContext(XpubContext)

  const { loading, error, data, refetch } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'network-only',
    // TODO: useCallback used because of bug: https://github.com/apollographql/apollo-client/issues/6301
    onCompleted: useCallback(dataTemp => updateStuff(dataTemp), []),
  })

  const { loading: loading2, error: error2, data: data2 } = useQuery(
    CSS_QUERY,
    {
      fetchPolicy: 'network-only',
    },
  )

  const previousDataRef = useRef(null)

  // Do this to prevent polling-related flicker
  if (loading && loading2 && !previousDataRef.current) {
    return <Spinner />
  }

  let notice = ''

  if (error || error2) {
    if (error.networkError) {
      notice = 'You are offline.'
    } else {
      const redirectlocation = `/login`
      return <Redirect to={redirectlocation} />
    }
  }

  const currentUser = data && data.currentUser

  journal.textStyles = data2 && data2.builtCss.css

  previousDataRef.current = data

  const urlFrag = journal.metadata.toplevel_urlfragment
  const { pathname } = history.location
  const showLinks = pathname.match(/^\/(submit|manuscript)/g)
  let links = []
  const submissionFormBuilderLink = `${urlFrag}/admin/submission-form-builder`
  const reviewFormBuilderLink = `${urlFrag}/admin/review-form-builder`
  const decisionFormBuilderLink = `${urlFrag}/admin/decision-form-builder`
  const homeLink = `${urlFrag}/dashboard`
  const profileLink = `${urlFrag}/profile`
  const manuscriptsLink = `${urlFrag}/admin/manuscripts`
  const reportsLink = `${urlFrag}/admin/reports`
  const userAdminLink = `${urlFrag}/admin/users`
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
    ['aperture', 'colab', 'ncrc'].includes(process.env.INSTANCE_NAME)
  ) {
    links.push({ link: homeLink, name: 'Dashboard', icon: 'home' })
  }

  if (currentUser && currentUser.admin) {
    links.push({
      link: manuscriptsLink,
      name: 'Manuscripts',
      icon: 'file-text',
    })
    if (process.env.INSTANCE_NAME !== 'ncrc')
      links.push({ link: reportsLink, name: 'Reports', icon: 'activity' })
  }

  if (currentUser) {
    links.push({
      links: [
        { link: submissionFormBuilderLink, name: 'Submission' },
        { link: reviewFormBuilderLink, name: 'Review' },
        { link: decisionFormBuilderLink, name: 'Decision' },
        links.push({
          menu: 'setting',
          name: '',
          icon: 'settings',
          links: [{ menu: 'forms', name: 'Forms', icon: 'check-square' }],
        }),
      ],
    })
  }

  if (currentUser && currentUser.admin) {
    links.push({ link: '', name: 'Tasks', icon: 'list' })
    links.push({ link: userAdminLink, name: 'Users', icon: 'users' })
  }

  // Throttled refetch query `currentUser` once every 2mins
  const throttledRefetch = throttle(refetch, 120000, { trailing: false })

  // Triggered by captured events onClick and onKeyDown
  const handleEvent = e => {
    throttledRefetch()
  }

  return (
    <Root
      converting={conversion.converting}
      onClickCapture={handleEvent}
      onKeyDownCapture={handleEvent}
    >
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
          component={Profile}
          exact
          path={profileLink}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={Profile}
          currentUser={currentUser}
          exact
          key="view-profile"
          path={`${urlFrag}/profile/:id`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={DashboardPage}
          currentUser={currentUser}
          exact
          path={homeLink}
          redirectLink={redirectLink}
        />

        <PrivateRoute
          component={NewSubmissionPage}
          currentUser={currentUser}
          exact
          path={`${urlFrag}/newSubmission`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={SubmitPage}
          currentUser={currentUser}
          exact
          path={`${urlFrag}/versions/:version/submit`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={ReviewersPage}
          currentUser={currentUser}
          exact
          path={`${urlFrag}/versions/:version/reviewers`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={ReviewPage}
          currentUser={currentUser}
          exact
          path={`${urlFrag}/versions/:version/review`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={ReviewPreviewPage}
          currentUser={currentUser}
          exact
          path={`${urlFrag}/versions/:version/reviewPreview`}
          redirectLink={redirectLink}
        />
        <PrivateRoute
          component={DecisionPage}
          currentUser={currentUser}
          exact
          path={`${urlFrag}/versions/:version/decision`}
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
        {currentUser &&
          currentUser.admin && [
            <PrivateRoute
              component={FormBuilderPage}
              currentUser={currentUser}
              exact
              key="form-builder"
              path={`${urlFrag}/admin/form-builder`}
              redirectLink={redirectLink}
            />,
            <PrivateRoute
              category="submission"
              component={FormBuilderPage}
              currentUser={currentUser}
              exact
              key="submission-form-builder"
              path={`${urlFrag}/admin/submission-form-builder`}
              redirectLink={redirectLink}
            />,
            <PrivateRoute
              category="review"
              component={FormBuilderPage}
              currentUser={currentUser}
              exact
              key="review-form-builder"
              path={`${urlFrag}/admin/review-form-builder`}
              redirectLink={redirectLink}
            />,
            <PrivateRoute
              category="decision"
              component={FormBuilderPage}
              currentUser={currentUser}
              exact
              key="decision-form-builder"
              path={`${urlFrag}/admin/decision-form-builder`}
              redirectLink={redirectLink}
            />,
            <PrivateRoute
              component={ManuscriptPage}
              currentUser={currentUser}
              exact
              key="manuscript"
              path={`${urlFrag}/versions/:version/manuscript`}
              redirectLink={redirectLink}
            />,
            <PrivateRoute
              component={UsersManager}
              currentUser={currentUser}
              key="users"
              path={`${urlFrag}/admin/users`}
              redirectLink={redirectLink}
            />,
            <PrivateRoute
              component={ManuscriptsPage}
              currentUser={currentUser}
              key="manuscripts"
              path={`${urlFrag}/admin/manuscripts`}
              redirectLink={redirectLink}
            />,
            <PrivateRoute
              component={ReportPage}
              currentUser={currentUser}
              key="reports"
              path={reportsLink}
              redirectLink={redirectLink}
            />,
            <PrivateRoute
              component={ProductionPage}
              currentUser={currentUser}
              key="production"
              path={`${urlFrag}/versions/:version/production`}
              redirectLink={redirectLink}
            />,
          ]}
      </Switch>
      <RolesUpdater />
    </Root>
  )
}

export default AdminPage
