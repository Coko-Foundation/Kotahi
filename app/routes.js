import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Login from './components/component-login/src'

import AdminPage from './components/AdminPage'

import {
  Frontpage,
  ManuscriptDetails,
} from './components/component-frontpage/src'

export default (
  <Switch>
    {/* AdminPage has nested routes within */}
    <Route path="/journal">
      <AdminPage />
    </Route>
    <Route component={Login} path="/login" />
    <Route component={Frontpage} exact path="/" />
    <Route component={ManuscriptDetails} path="/:manuscriptId" />
  </Switch>
)
