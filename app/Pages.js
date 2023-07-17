import React from 'react'
import { Route, Switch, useLocation, useHistory } from 'react-router-dom'
import { grid } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'
import { useQuery } from '@apollo/client'
import { ConfigProvider } from './components/config/src'
import { DynamicThemeProvider } from './components/theme/src'
import theme, { setBrandColors } from './theme'
import GlobalStyle from './theme/elements/GlobalStyle'
import { Spinner, CommsErrorBanner } from './components/shared'

import { GET_GROUP_BY_NAME } from './queries'

import Login from './components/component-login/src'
import ArticleArtifactPage from './components/component-published-artifact/components/ArticleArtifactPage'
import DeclineArticleOwnershipPage from './components/component-dashboard/src/components/DeclineArticleOwnershipPage'
import AcceptArticleOwnershipPage from './components/component-dashboard/src/components/AcceptArticleOwnershipPage'
import InvitationAcceptedPage from './components/component-dashboard/src/components/InvitationAcceptedPage'

import AdminPage from './components/AdminPage'

import Frontpage from './components/component-frontpage/src/Frontpage'
import GroupPage from './components/component-frontpage/src/GroupPage'

const Container = styled.div`
  display: grid;
  height: 10vh;
  place-items: center;
`

const Content = styled.div`
  margin-bottom: 1rem;
  max-width: 40em;
  padding: ${grid(4)};
  text-align: center;

  h1 {
    margin-bottom: ${grid(2)};
  }
`

const Centered = styled.div`
  text-align: center;
`

const Pages = () => {
  const location = useLocation()
  const history = useHistory()

  // Handles old login path redirects to group front page
  if (location.pathname === '/login') {
    history.push(`/`)
  }

  const name = location.pathname.split('/')[1]

  const { loading, error, data } = useQuery(GET_GROUP_BY_NAME, {
    variables: { name },
    skip: !name,
  })

  if (loading && !data) return <Spinner />
  if (error)
    return (
      <Container>
        <Centered>
          <Content>
            <CommsErrorBanner error={error} />
          </Content>
        </Centered>
      </Container>
    )

  window.localStorage.setItem('groupId', data?.groupByName?.id)

  // TODO: Remove old config once refactor of config is completed
  const oldConfig = JSON.parse(data?.groupByName?.oldConfig || '{}')

  const activeConfig = data?.groupByName?.configs?.find(
    config => config?.active,
  )

  const config = {
    id: activeConfig?.id,
    groupId: data?.groupByName?.id,
    groupName: data?.groupByName?.name,
    urlFrag: `/${data?.groupByName?.name}`,
    ...oldConfig,
    ...JSON.parse(activeConfig?.formData || '{}'),
  }

  // Overwrites config theme colors
  setBrandColors(
    config?.groupIdentity?.primaryColor,
    config?.groupIdentity?.secondaryColor,
  )

  const { urlFrag } = config

  return (
    <DynamicThemeProvider theme={theme}>
      <GlobalStyle />
      <ConfigProvider config={config}>
        <Switch>
          <Route component={GroupPage} exact path="/" />
          <Route component={Frontpage} exact path={`${urlFrag}`} />
          <Route component={Login} exact path={`${urlFrag}/login`} />
          <Route
            component={ArticleArtifactPage}
            exact
            path={`${urlFrag}/versions/:version/artifacts/:artifactId`}
          />
          <Route
            component={DeclineArticleOwnershipPage}
            exact
            path={`${urlFrag}/decline/:invitationId`}
          />
          <Route
            component={AcceptArticleOwnershipPage}
            exact
            path={`${urlFrag}/acceptarticle/:invitationId`}
          />
          <Route
            component={InvitationAcceptedPage}
            exact
            path={`${urlFrag}/invitation/accepted`}
          />
          {/* AdminPage has nested routes within */}
          <Route path={`${urlFrag}`}>
            <AdminPage />
          </Route>
        </Switch>
      </ConfigProvider>
    </DynamicThemeProvider>
  )
}

export default Pages
