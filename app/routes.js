import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

// Common PubSweet components
import Login from 'pubsweet-component-login'
import Signup from 'pubsweet-component-signup'
import PasswordReset from '@pubsweet/component-password-reset-client'
import UsersManager from 'pubsweet-component-users-manager'

// SimpleJ-specific components
import Dashboard from './components/component-xpub-dashboard/src/components/Dashboard'
import SubmitPage from './components/component-xpub-submit/src/components/SubmitPage'
import ManuscriptPage from './components/component-xpub-manuscript/src/components/ManuscriptPage'
import ReviewersPage from './components/component-xpub-review/src/components/ReviewersPage'
import ReviewPage from './components/component-xpub-review/src/components/ReviewPage'
import TeamPage from './components/component-xpub-teams-manager/src/components/TeamsManagerPage'
import DecisionPage from './components/component-xpub-review/src/components/DecisionPage'
import FormBuilderPage from './components/component-xpub-formbuilder/src/components/FormBuilderPage'

import { Profile } from './components/component-profile/src'

import App from './components/App'

// const createReturnUrl = ({ pathname, search = '' }) => pathname + search
// const loginUrl = location => `/login?next=${createReturnUrl(location)}`

// TODO: Redirect if token expires
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      localStorage.getItem('token') ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login?next=/dashboard" />
      )
    }
  />
)

// TODO: use componentDidMount to fetch the current user before rendering?

export default (
  <App>
    <Switch>
      <PrivateRoute component={Dashboard} exact path="/dashboard" />
      <PrivateRoute
        component={SubmitPage}
        exact
        path="/journals/:journal/versions/:version/submit"
      />
      <PrivateRoute component={TeamPage} exact path="/teams" />
      <PrivateRoute
        component={FormBuilderPage}
        exact
        path="/admin/form-builder"
      />
      {/* <PrivateRoute
        component={SimpleFormBuilderPage}
        exact
        path="/admin/simple-form-builder"
      /> */}
      <PrivateRoute
        component={ManuscriptPage}
        exact
        path="/journals/:journal/versions/:version/manuscript"
      />
      <PrivateRoute
        component={ReviewersPage}
        exact
        path="/journals/:journal/versions/:version/reviewers"
      />
      <PrivateRoute
        component={ReviewPage}
        exact
        path="/journals/:journal/versions/:version/reviews/:review"
      />
      <PrivateRoute
        component={DecisionPage}
        exact
        path="/journals/:journal/versions/:version/decisions/:decision"
      />
      <PrivateRoute path="/profile" component={Profile} exact path="/profile" />
      {/* <PrivateRoute
        component={FindReviewersPage}
        exact
        path="/journals/:journal/versions/:version/find-reviewers"
      />
      <PrivateRoute
        component={FindReviewersAuthorPage}
        exact
        path="/journals/:journal/versions/:version/find-reviewers/author/:id"
      />
      <PrivateRoute
        component={FindReviewersPaperPage}
        exact
        path="/journals/:journal/versions/:version/find-reviewers/paper/:id"
      /> */}

      <Route component={Signup} exact path="/signup" />
      <Route component={Login} path="/login" />
      <Route component={PasswordReset} path="/password-reset" />
      <PrivateRoute component={UsersManager} path="/users" />

      {/* <PrivateRoute component={Dashboard} path="*" /> */}
    </Switch>
    {/* <Redirect from="/" to="/dashboard"/> */}
  </App>
)
