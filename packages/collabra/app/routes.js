import React from 'react'
import { Redirect, Route } from 'react-router'
// import loadable from 'loadable-components'

import App from './components/app'
import AuthenticatedPage from './components/AuthenticatedPage'

import Signup from 'pubsweet-component-signup/Signup'
import Login from 'pubsweet-component-login/Login'
import Logout from './components/Logout'
import PasswordReset from 'pubsweet-component-password-reset-frontend/PasswordReset'

import DashboardPage from 'pubsweet-component-xpub-dashboard/src/components'

import SubmitPage from 'pubsweet-component-xpub-submit/src/components'

import ManuscriptPage from 'pubsweet-component-xpub-manuscript/src/components'
// const ManuscriptPage = loadable(() => import('pubsweet-component-xpub-manuscript/src/components'))

export default (
  <Route>
    <Redirect from="/" to="/projects"/>

    <Route path="/" component={App}>
      <Route component={AuthenticatedPage}>
        <Route path="dashboard" component={DashboardPage}/>
        <Route path="projects/:project/submit" component={SubmitPage}/>
        <Route path="projects/:project/manuscript" component={ManuscriptPage}/>
      </Route>

      <Route path="signup" component={Signup}/>
      <Route path="login" component={Login}/>
      <Route path="logout" component={Logout}/>
      <Route path="password-reset" component={PasswordReset}/>
    </Route>
  </Route>
)
