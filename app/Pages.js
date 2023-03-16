import React from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { ConfigProvider } from './components/config/src'
import { DynamicThemeProvider } from './components/theme/src'
import theme from './theme'
import GlobalStyle from './theme/elements/GlobalStyle'
import { Spinner, CommsErrorBanner } from './components/shared'

import { GET_CONFIG } from './queries'

const Pages = ({ routes }) => {
  const { loading, error, data } = useQuery(GET_CONFIG, {
    fetchPolicy: 'network-only',
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  // TODO: Remove old config once refactor of config is completed
  const oldConfig = JSON.parse(data?.oldConfig || '{}')
  const newConfig = JSON.parse(data?.config?.formData || '{}')

  const config = {
    ...oldConfig,
    ...newConfig,
  }

  // Overwrites hardcoded theme with config theme colors
  const dynamicTheme = {
    ...theme,
    colorPrimary: config?.groupIdentity?.primaryColor,
    colorSecondary: config?.groupIdentity?.secondaryColor,
  }

  return (
    <DynamicThemeProvider theme={dynamicTheme}>
      <GlobalStyle />
      <ConfigProvider config={config}>
        <BrowserRouter>{routes}</BrowserRouter>
      </ConfigProvider>
    </DynamicThemeProvider>
  )
}

Pages.propTypes = {
  routes: PropTypes.node.isRequired,
}

export default Pages
