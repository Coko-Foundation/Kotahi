import React from 'react'
import { Redirect, Route } from 'react-router'
import Loadable from 'react-loadable'

import Login from 'pubsweet-component-login/Login'
import Signup from 'pubsweet-component-signup/Signup'
import PasswordReset from 'pubsweet-component-password-reset-frontend/PasswordReset'
import Manage from 'pubsweet-component-manage/Manage'
import { requireAuthentication } from 'pubsweet-client/src/components/AuthenticatedComponent'

const ProjectList = Loadable({
  loader: () => import('./components/ProjectList'),
  loading: () => null
})

const Editor = Loadable({
  loader: () => import('./components/Editor'),
  loading: () => null
})

const Project = Loadable({
  loader: () => import('./components/Project'),
  loading: () => null
})

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
