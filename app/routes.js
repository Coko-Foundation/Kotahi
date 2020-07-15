import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import Login from './components/component-login'

import AdminPage from './components/AdminPage'

// const createReturnUrl = ({ pathname, search = '' }) => pathname + search
// const loginUrl = location => `/login?next=${createReturnUrl(location)}`

// const adminWrap = Component => props => (
//   <AdminPage {...props}>
//     <Component {...props} />
//   </AdminPage>
// )
// TODO: use componentDidMount to fetch the current user before rendering?

export default (
  <Switch>
    {/* AdminPage has nested routes within */}
    <Route path="/journal">
      <AdminPage />
    </Route>

    {/* <PrivateRoute
        component={FindReviewersPage}
        exact
        path="/journals/:journal/versions/:version/find-reviewers"
      />
      <PrivateRoute
        component={FindReviewersAuthorPage}
        exact
        path="/journals/:journal/versions/:version/find-reviewers/author/:id"
      />
      <PrivateRoute
        component={FindReviewersPaperPage}
        exact
        path="/journals/:journal/versions/:version/find-reviewers/paper/:id"
      /> */}

    <Route component={Login} path="/login" />
  </Switch>
)
