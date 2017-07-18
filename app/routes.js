import React from 'react'
import { IndexRoute, Redirect, Route } from 'react-router'

import App from './components/app'
import AuthenticatedContainer from './components/AuthenticatedContainer'
import WaxContainer from './components/WaxContainer'

import Signup from 'pubsweet-component-signup/Signup'
import Login from 'pubsweet-component-login/Login'
import PasswordReset from 'pubsweet-component-password-reset-frontend/PasswordReset'

import ProjectListContainer from 'pubsweet-component-xpub-dashboard/components/ProjectListContainer'
import ProjectContainer from 'pubsweet-component-xpub-submission/components/ProjectContainer'
import VersionsListContainer from 'pubsweet-component-xpub-submission/components/VersionsListContainer'
import DeclarationsContainer from 'pubsweet-component-xpub-submission/components/DeclarationsContainer'

export default (
  <Route>
    <Redirect from="/" to="/projects"/>

    <Route path="/" component={App}>
      <Route component={AuthenticatedContainer}>
        <Route path="projects" component={ProjectListContainer}/>

        <Route path="projects/:project" component={ProjectContainer}>
          <IndexRoute component={VersionsListContainer}/>

          <Route path="declarations" component={DeclarationsContainer}/>
        </Route>

        <Route path="editor/:project/:version" component={WaxContainer}/>
      </Route>

      <Route path="signup" component={Signup}/>
      <Route path="login" component={Login}/>
      <Route path="password-reset" component={PasswordReset}/>
    </Route>
  </Route>
)
