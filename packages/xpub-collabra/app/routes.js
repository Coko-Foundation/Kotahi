import React from 'react'
import { withProps } from 'recompose'
import { Route, Switch } from 'react-router-dom'
import { AuthenticatedComponent } from 'pubsweet-client'

import App from 'pubsweet-component-xpub-app/src/components'
import Login from 'pubsweet-component-login/LoginContainer'
import Signup from 'pubsweet-component-signup/SignupContainer'

import DashboardPage from 'pubsweet-component-xpub-dashboard/src/components/DashboardPage'
import SubmitPage from 'pubsweet-component-xpub-submit/src/components/SubmitPage'
import ManuscriptPage from 'pubsweet-component-xpub-manuscript/src/components/ManuscriptPage'
import ReviewersPage from 'pubsweet-component-xpub-review/src/components/ReviewersPage'
import ReviewPage from 'pubsweet-component-xpub-review/src/components/ReviewPage'
import DecisionPage from 'pubsweet-component-xpub-review/src/components/DecisionPage'

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

      <Route component={Signup} exact path="/signup" />
      <Route component={LoginPage} exact path="/login" />
      <PrivateRoute component={DashboardPage} path="*" />
    </Switch>
    {/* <Redirect from="/" to="/dashboard"/> */}
  </App>
)

export default Routes
