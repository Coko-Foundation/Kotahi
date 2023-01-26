import React from 'react'
import { Route, Switch } from 'react-router-dom'

import config from 'config'
import Login from './components/component-login/src'
import ArticleArtifactPage from './components/component-published-artifact/components/ArticleArtifactPage'
import DeclineArticleOwnershipPage from './components/component-dashboard/src/components/DeclineArticleOwnershipPage'
import AcceptArticleOwnershipPage from './components/component-dashboard/src/components/AcceptArticleOwnershipPage'
import InvitationAcceptedPage from './components/component-dashboard/src/components/InvitationAcceptedPage'

import AdminPage from './components/AdminPage'

import Frontpage from './components/component-frontpage/src/Frontpage'

export default (
  <Switch>
    {/* AdminPage has nested routes within */}
    <Route path={config.journal.metadata.toplevel_urlfragment}>
      <AdminPage />
    </Route>
    <Route component={Login} path="/login" />
    <Route component={Frontpage} exact path="/" />
    <Route
      component={ArticleArtifactPage}
      exact
      path="/versions/:version/artifacts/:artifactId"
    />
    <Route
      component={DeclineArticleOwnershipPage}
      exact
      path="/decline/:invitationId"
    />
    <Route
      component={AcceptArticleOwnershipPage}
      exact
      path="/acceptarticle/:invitationId"
    />
    <Route
      component={InvitationAcceptedPage}
      exact
      path="/invitation/accepted"
    />
  </Switch>
)
