import React from 'react'
import { Route, withRouter } from 'react-router-dom'
import loadable from 'loadable-components'

import { App } from 'pubsweet-component-xpub-app/src/components'

import {
  PrivateRoute,
  SignupPage,
  LoginPage,
  LogoutPage
} from 'pubsweet-component-xpub-authentication/src/components'

const DashboardPage = loadable(() =>
  import('pubsweet-component-xpub-dashboard/src/components/DashboardPage'))

const SubmitPage = loadable(() =>
  import('pubsweet-component-xpub-submit/src/components/SubmitPage'))

const ManuscriptPage = loadable(() =>
  import('pubsweet-component-xpub-manuscript/src/components/ManuscriptPage'))

const ReviewersPage = loadable(() =>
  import('pubsweet-component-xpub-review/src/components/ReviewersPage'))

const ReviewPage = loadable(() =>
  import('pubsweet-component-xpub-review/src/components/ReviewPage'))

const DecisionPage = loadable(() =>
  import('pubsweet-component-xpub-review/src/components/DecisionPage'))

// TODO: use componentDidMount to fetch the current user before rendering?

const Root = () => (
  <App>
    <PrivateRoute exact path="/" component={DashboardPage}/>
    <PrivateRoute exact path="/projects/:project/versions/:version/submit" component={SubmitPage}/>
    <PrivateRoute exact path="/projects/:project/versions/:version/manuscript" component={ManuscriptPage}/>
    <PrivateRoute exact path="/projects/:project/versions/:version/reviewers" component={ReviewersPage}/>
    <PrivateRoute exact path="/projects/:project/versions/:version/reviews/:review" component={ReviewPage}/>
    <PrivateRoute exact path="/projects/:project/versions/:version/decisions/:decision" component={DecisionPage}/>

    <PrivateRoute exact path="/logout" component={LogoutPage}/>

    <Route exact path="/signup" component={SignupPage}/>
    <Route exact path="/login" component={LoginPage}/>

    {/*<Redirect from="/" to="/dashboard"/>*/}
  </App>
)

export default withRouter(Root)
