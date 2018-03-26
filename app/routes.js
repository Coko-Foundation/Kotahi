import React from 'react'
import { withProps } from 'recompose'
import { Route, Switch } from 'react-router-dom'
import { AuthenticatedComponent } from 'pubsweet-client'

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
import DecisionPage from 'pubsweet-component-xpub-review/src/components/DecisionPage'

import App from './components/App'
import UsersManager from 'pubsweet-component-users-manager/src/UsersManagerContainer'

const LoginPage = withProps({ passwordReset: false })(Login)

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      <AuthenticatedComponent>
        <Component {...props} />
      </AuthenticatedComponent>
    )}
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
      {/* <PrivateRoute
        component={FindReviewersPage}
        exact
        path="/projects/:project/versions/:version/find-reviewers"
      />
      <PrivateRoute
        component={FindReviewersAuthorPage}
        exact
        path="/projects/:project/versions/:version/find-reviewers/author/:id"
      />
      <PrivateRoute
        component={FindReviewersPaperPage}
        exact
        path="/projects/:project/versions/:version/find-reviewers/paper/:id"
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
