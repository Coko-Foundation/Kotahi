import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import Login from './components/component-login'
import UsersManager from './components/component-users-manager'
import Manuscripts from './components/component-manuscripts'
import Dashboard from './components/component-dashboard/src/components/Dashboard'
import SubmitPage from './components/component-submit/src/components/SubmitPage'
import ManuscriptPage from './components/component-manuscript/src/components/ManuscriptPage'
import ReviewersPage from './components/component-review/src/components/ReviewersPage'
import ReviewPage from './components/component-review/src/components/ReviewPage'
import TeamPage from './components/component-teams-manager/src/components/TeamsManagerPage'
import DecisionPage from './components/component-review/src/components/DecisionPage'
import FormBuilderPage from './components/component-formbuilder/src/components/FormBuilderPage'
import NewSubmissionPage from './components/component-submit/src/components/NewSubmissionPage'

import { Profile } from './components/component-profile/src'

import MainPage from './components/MainPage'

// const createReturnUrl = ({ pathname, search = '' }) => pathname + search
// const loginUrl = location => `/login?next=${createReturnUrl(location)}`

// TODO: Redirect if token expires
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      localStorage.getItem('token') ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login?next=/dashboard" />
      )
    }
  />
)

// TODO: use componentDidMount to fetch the current user before rendering?

export default (
  <MainPage>
    <Switch>
      <PrivateRoute component={Dashboard} exact path="/journal/home" />
      <PrivateRoute
        component={NewSubmissionPage}
        exact
        path="/journal/newSubmission"
      />
      <PrivateRoute
        component={SubmitPage}
        exact
        path="/journal/versions/:version/submit"
      />
      <PrivateRoute component={TeamPage} exact path="/journal/admin/teams" />
      <PrivateRoute
        component={FormBuilderPage}
        exact
        path="/journal/admin/form-builder"
      />
      <PrivateRoute
        component={ManuscriptPage}
        exact
        path="/journal/versions/:version/manuscript"
      />
      <PrivateRoute
        component={ReviewersPage}
        exact
        path="/journal/versions/:version/reviewers"
      />
      <PrivateRoute
        component={ReviewPage}
        exact
        path="/journal/versions/:version/reviews/:review"
      />
      <PrivateRoute
        component={DecisionPage}
        exact
        path="/journal/versions/:version/decisions/:decision"
      />
      <PrivateRoute
        path="/journal/profile"
        component={Profile}
        exact
        path="/journal/profile"
      />
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
      <PrivateRoute component={UsersManager} path="/journal/admin/users" />
      <PrivateRoute component={Manuscripts} path="/journal/admin/manuscripts" />

      {/* <PrivateRoute component={Dashboard} path="*" /> */}
    </Switch>
    {/* <Redirect from="/" to="/dashboard"/> */}
  </MainPage>
)
