import React from 'react'
import { Route, Switch } from 'react-router-dom'

import config from 'config'
import Login from './components/component-login/src'
import ArticleEvaluationPage from './components/component-evaluation'
import ArticleEvaluationResultPage from './components/component-evaluation-result'
import ArticleEvaluationSummaryPage from './components/component-evaluation-summary'
import DeclineArticleOwnershipPage from './components/component-dashboard/src/components/DeclineArticleOwnershipPage'
import AcceptArticleOwnershipPage from './components/component-dashboard/src/components/AcceptArticleOwnershipPage'

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
    <Route
      component={ArticleEvaluationResultPage}
      exact
      path="/versions/:version/article-evaluation-result/:evaluationNumber"
    />
    <Route
      component={ArticleEvaluationSummaryPage}
      exact
      path="/versions/:version/article-evaluation-summary"
    />
    <Route
      component={ArticleEvaluationPage}
      exact
      path="/versions/:version/article-evaluation/:fieldNameA"
    />
    <Route
      component={ArticleEvaluationPage}
      exact
      path="/versions/:version/article-evaluation/:fieldNameA/:fieldNameB"
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
  </Switch>
)
