import React from 'react'
import { IndexRoute, Redirect, Route } from 'react-router'
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

        <Route path="projects/:project" component={chunk(import('./components/Project'))}>
          <IndexRoute component={chunk(import('./components/Snapshots'))}/>

          <Route path="declarations" component={chunk(import('./components/Declarations'))}/>
          <Route path="editor" component={chunk(import('./components/Editor'))}/>
          <Route path="reviewers" component={chunk(import('./components/Reviewers'))}/>
          <Route path="roles/:roleType/:role" component={chunk(import('./components/Role'))}/>
        </Route>

        <Route path="editor/:project/:snapshot" component={chunk(import('./components/ArticleEditor'))}/>
      </Route>

      <Route path="signup" component={chunk(import('pubsweet-component-signup/Signup'))}/>
      <Route path="login" component={chunk(import('pubsweet-component-login/Login'))}/>
      <Route path="password-reset" component={chunk(import('pubsweet-component-password-reset-frontend/PasswordReset'))}/>
    </Route>
  </Route>
)
