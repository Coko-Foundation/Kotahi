import React from 'react'
import { Redirect, Route } from 'react-router'
import Loadable from 'react-loadable'
import App from './components/app'
import AuthenticatedContainer from './components/AuthenticatedContainer'

const chunk = (component) => Loadable({
  loader: () => component,
  loading: () => null
})

export default (
  <Route>
    <Redirect from="/" to="/projects"/>

    <Route path="/" component={App}>
      <Route component={AuthenticatedContainer}>
        <Route path="projects" component={chunk(import('./components/ProjectList'))}/>
        <Route path="projects/:project" component={chunk(import('./components/Project'))}/>
        <Route path="reviewers/:project" component={chunk(import('./components/Reviewers'))}/>
        <Route path="editor/:project/:snapshot" component={chunk(import('./components/Editor'))}/>
      </Route>

      <Route path="/signup" component={chunk(import('pubsweet-component-signup/Signup'))}/>
      <Route path="/login" component={chunk(import('pubsweet-component-login/Login'))}/>
      <Route path="/password-reset" component={chunk(import('pubsweet-component-password-reset-frontend/PasswordReset'))}/>
    </Route>
  </Route>
)
