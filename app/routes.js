import React from 'react'
import { withProps } from 'recompose'
import { Route, Switch, Redirect } from 'react-router-dom'
// import AuthorizeWithGraphQL from 'pubsweet-client/src/helpers/AuthorizeWithGraphQL'

import Login from 'pubsweet-component-login/LoginContainer'
import Signup from 'pubsweet-component-signup/SignupContainer'

// import {
//   FindReviewersPage,
//   AuthorPage as FindReviewersAuthorPage,
//   PaperPage as FindReviewersPaperPage,
// } from 'pubsweet-component-xpub-find-reviewers/src/components'

import DashboardPage from 'pubsweet-component-xpub-dashboard/src/components/DashboardPage'
import SubmitPage from 'pubsweet-component-xpub-submit/src/components/SubmitPage'
import ManuscriptPage from 'pubsweet-component-xpub-manuscript/src/components/ManuscriptPage'
import ReviewersPage from 'pubsweet-component-xpub-review/src/components/ReviewersPage'
import ReviewPage from 'pubsweet-component-xpub-review/src/components/ReviewPage'
import TeamPage from 'pubsweet-component-xpub-teams-manager/src/components/TeamsManagerPage'
import DecisionPage from 'pubsweet-component-xpub-review/src/components/DecisionPage'
import UsersManager from 'pubsweet-component-users-manager/src/UsersManagerContainer'
import FormBuilderPage from 'pubsweet-component-xpub-formbuilder/src/components/FormBuilderPage'
// import SimpleFormBuilderPage from 'pubsweet-component-xpub-simple-formbuilder/src/components/SimpleFormBuilderPage'
import App from './components/App'

const LoginPage = withProps({ passwordReset: false })(Login)

const createReturnUrl = ({ pathname, search = '' }) => pathname + search

const loginUrl = location => `/login?next=${createReturnUrl(location)}`

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      localStorage.getItem('token') ? (
        <Component {...props} />
      ) : (
        <Redirect to={loginUrl(props.location)} />
      )
    }
  />
)

// TODO: use componentDidMount to fetch the current user before rendering?

const Routes = () => (
  <App>
    <Switch>
      <PrivateRoute component={DashboardPage} exact path="/" />
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
      <Route component={LoginPage} exact path="/login" />
      <PrivateRoute component={UsersManager} path="/users" />

      <PrivateRoute component={DashboardPage} path="*" />
    </Switch>
    {/* <Redirect from="/" to="/dashboard"/> */}
  </App>
)

export default Routes
