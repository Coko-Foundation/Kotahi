import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Login from './components/component-login/src'

import AdminPage from './components/AdminPage'

export default (
  <Switch>
    {/* AdminPage has nested routes within */}
    <Route path="/journal">
      <AdminPage />
    </Route>
    <Route component={Login} path="/login" />
  </Switch>
)
