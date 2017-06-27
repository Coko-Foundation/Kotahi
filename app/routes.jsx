import React from 'react'
import { Redirect, Route } from 'react-router'

import Login from 'pubsweet-component-login/Login'
import Signup from 'pubsweet-component-signup/Signup'
import PasswordReset from 'pubsweet-component-password-reset-frontend/PasswordReset'
import Manage from 'pubsweet-component-manage/Manage'
import { requireAuthentication } from 'pubsweet-client/src/components/AuthenticatedComponent'

import ProjectList from './components/ProjectList'
import Editor from './components/Editor'
import Project from './components/Project'

const AuthenticatedManage = requireAuthentication(Manage, 'view', state => state.collections)

export default (
  <Route>
      <Redirect from="/" to="/projects"/>

      <Route path="/" component={AuthenticatedManage}>
        <Route path="projects" component={ProjectList}/>
        <Route path="projects/:project" component={Project}/>
        <Route path="editor/:project/:snapshot" component={Editor}/>
      </Route>

      <Route path="/signup" component={Signup}/>
      <Route path="/login" component={Login}/>
      <Route path="/password-reset" component={PasswordReset}/>
  </Route>
)
