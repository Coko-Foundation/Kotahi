import React from 'react'
import { Redirect, Route } from 'react-router'
// import loadable from 'loadable-components'
import { App } from 'pubsweet-component-xpub-app/src/components'
import { AuthenticatedPage, SignupPage, LoginPage, LogoutPage } from 'pubsweet-component-xpub-authentication/src/components'
import DashboardPage from 'pubsweet-component-xpub-dashboard/src/components'
import SubmitPage from 'pubsweet-component-xpub-submit/src/components'
import ManuscriptPage from 'pubsweet-component-xpub-manuscript/src/components'
// const ManuscriptPage = loadable(() => import('pubsweet-component-xpub-manuscript/src/components'))

export default (
  <Route>
    <Redirect from="/" to="/dashboard"/>

    <Route path="/" component={App}>
      <Route component={AuthenticatedPage}>
        <Route path="dashboard" component={DashboardPage}/>
        <Route path="projects/:project/submit" component={SubmitPage}/>
        <Route path="projects/:project/manuscript" component={ManuscriptPage}/>
      </Route>

      <Route path="signup" component={SignupPage}/>
      <Route path="login" component={LoginPage}/>
      <Route path="logout" component={LogoutPage}/>
    </Route>
  </Route>
)
