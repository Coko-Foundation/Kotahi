import React from 'react'
import { Route, Switch } from 'react-router-dom'

import config from 'config'
import Login from './components/component-login/src'
import ArticleEvaluationResultPage from './components/component-evaluation-result'
import ArticleEvaluationSummaryPage from './components/component-evaluation-summary'

import AdminPage from './components/AdminPage'

import {
  Frontpage,
  ManuscriptDetails,
} from './components/component-frontpage/src'

export default (
  <Switch>
    {/* AdminPage has nested routes within */}
    <Route path={config.journal.metadata.toplevel_urlfragment}>
      <AdminPage />
    </Route>
    <Route component={Login} path="/login" />
    <Route component={Frontpage} exact path="/" />
    <Route component={ManuscriptDetails} exact path="/:manuscriptId" />
    {['elife'].includes(process.env.INSTANCE_NAME) && (
      <Route
        component={ArticleEvaluationResultPage}
        exact
        path="/versions/:version/article-evaluation-result/:evaluationNumber"
      />
    )}
    {['elife'].includes(process.env.INSTANCE_NAME) && (
      <Route
        component={ArticleEvaluationSummaryPage}
        exact
        path="/versions/:version/article-evaluation-summary"
      />
    )}
  </Switch>
)
