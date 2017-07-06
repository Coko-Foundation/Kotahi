import React from 'react'
import { IndexRoute, Redirect, Route } from 'react-router'
import Loadable from 'react-loadable'
import App from './components/app'
import AuthenticatedContainer from './containers/AuthenticatedContainer'

const chunk = (component) => Loadable({
  loader: () => component,
  loading: () => null
})

export default (
  <Route>
    <Redirect from="/" to="/projects"/>

    <Route path="/" component={App}>
      <Route component={AuthenticatedContainer}>
        <Route path="projects"
               component={chunk(import('./containers/ProjectListContainer'))}/>

        <Route path="projects/:project"
               component={chunk(import('./containers/ProjectContainer'))}>
          <IndexRoute component={chunk(import('./containers/VersionsListContainer'))}/>

          <Route path="declarations"
                 component={chunk(import('./containers/DeclarationsContainer'))}/>
          <Route path="editors"
                 component={chunk(import('./containers/EditorsContainer'))}/>
          <Route path="reviewers"
                 component={chunk(import('./containers/ReviewersContainer'))}/>
          <Route path="roles/:roleType/:role"
                 component={chunk(import('./containers/RoleContainer'))}/>
        </Route>

        <Route path="editor/:project/:version"
               component={chunk(import('./containers/WaxContainer'))}/>
      </Route>

      <Route path="signup"
             component={chunk(import('pubsweet-component-signup/Signup'))}/>
      <Route path="login"
             component={chunk(import('pubsweet-component-login/Login'))}/>
      <Route path="password-reset"
             component={chunk(import('pubsweet-component-password-reset-frontend/PasswordReset'))}/>
    </Route>
  </Route>
)
