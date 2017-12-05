import React from 'react'
import { Route, withRouter } from 'react-router-dom'
import loadable from 'loadable-components'

import App from 'pubsweet-component-xpub-app/src/components'

import {
  PrivateRoute,
  SignupPage,
  LoginPage,
  LogoutPage,
} from 'pubsweet-component-xpub-authentication/src/components'

const DashboardPage = loadable(() =>
  import('pubsweet-component-xpub-dashboard/src/components/DashboardPage'),
)

const SubmitPage = loadable(() =>
  import('pubsweet-component-xpub-submit/src/components/SubmitPage'),
)

const ManuscriptPage = loadable(() =>
  import('pubsweet-component-xpub-manuscript/src/components/ManuscriptPage'),
)

const ReviewersPage = loadable(() =>
  import('pubsweet-component-xpub-review/src/components/ReviewersPage'),
)

const ReviewPage = loadable(() =>
  import('pubsweet-component-xpub-review/src/components/ReviewPage'),
)

const DecisionPage = loadable(() =>
  import('pubsweet-component-xpub-review/src/components/DecisionPage'),
)

// TODO: use componentDidMount to fetch the current user before rendering?

const Root = () => (
  <App>
    <PrivateRoute component={DashboardPage} exact path="/" />
    <PrivateRoute
      component={SubmitPage}
      exact
      path="/projects/:project/versions/:version/submit"
    />
    <PrivateRoute
      component={ManuscriptPage}
      exact
      path="/projects/:project/versions/:version/manuscript"
    />
    <PrivateRoute
      component={ReviewersPage}
      exact
      path="/projects/:project/versions/:version/reviewers"
    />
    <PrivateRoute
      component={ReviewPage}
      exact
      path="/projects/:project/versions/:version/reviews/:review"
    />
    <PrivateRoute
      component={DecisionPage}
      exact
      path="/projects/:project/versions/:version/decisions/:decision"
    />

    <PrivateRoute component={LogoutPage} exact path="/logout" />

    <Route component={SignupPage} exact path="/signup" />
    <Route component={LoginPage} exact path="/login" />

    {/* <Redirect from="/" to="/dashboard"/> */}
  </App>
)

export default withRouter(Root)
