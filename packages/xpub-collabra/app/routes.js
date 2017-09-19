import React from 'react'
import { Redirect, Route } from 'react-router'
import loadable from 'loadable-components'
import { App } from 'pubsweet-component-xpub-app/src/components'
import { AuthenticatedPage, SignupPage, LoginPage, LogoutPage } from 'pubsweet-component-xpub-authentication/src/components'

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

export default (
  <Route>
    <Redirect from="/" to="/dashboard"/>

    <Route path="/" component={App}>
      <Route component={AuthenticatedPage}>
        <Route path="dashboard" component={DashboardPage}/>
        <Route path="projects/:project/versions/:version/submit" component={SubmitPage}/>
        <Route path="projects/:project/versions/:version/manuscript" component={ManuscriptPage}/>
        <Route path="projects/:project/versions/:version/reviewers" component={ReviewersPage}/>
        <Route path="projects/:project/versions/:version/reviews/:review" component={ReviewPage}/>
        <Route path="projects/:project/versions/:version/decisions/:decision" component={DecisionPage}/>
      </Route>

      <Route path="signup" component={SignupPage}/>
      <Route path="login" component={LoginPage}/>
      <Route path="logout" component={LogoutPage}/>
    </Route>
  </Route>
)
