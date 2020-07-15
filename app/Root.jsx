/* eslint-disable no-param-reassign */
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import { ApolloProvider } from '@apollo/react-components'
import { ApolloClient } from 'apollo-client'
import { WebSocketLink } from 'apollo-link-ws'
import { split, ApolloLink } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { setContext } from 'apollo-link-context'
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'
import GlobalStyle from './theme/elements/GlobalStyle'

import introspectionQueryResultData from './fragmentTypes.json'

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
})

// See https://github.com/apollographql/apollo-feature-requests/issues/6#issuecomment-465305186
export function stripTypenames(obj) {
  Object.keys(obj).forEach(property => {
    if (
      obj[property] !== null &&
      typeof obj[property] === 'object' &&
      !(obj[property] instanceof File)
    ) {
      delete obj.property
      const newData = stripTypenames(obj[property], '__typename')
      obj[property] = newData
    } else if (property === '__typename') {
      delete obj[property]
    }
  })
  return obj
}
// Construct an ApolloClient. If a function is passed as the first argument,
// it will be called with the default client config as an argument, and should
// return the desired config.
const makeApolloClient = (makeConfig, connectToWebSocket) => {
  const uploadLink = createUploadLink()
  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  })

  const removeTypename = new ApolloLink((operation, forward) => {
    if (operation.variables) {
      operation.variables = stripTypenames(operation.variables)
    }
    return forward(operation)
  })

  let link = ApolloLink.from([removeTypename, authLink, uploadLink])

  if (connectToWebSocket) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const wsLink = new WebSocketLink({
      uri: `${wsProtocol}://${window.location.host}/subscriptions`,
      options: {
        reconnect: true,
        connectionParams: () => ({ authToken: localStorage.getItem('token') }),
      },
    })
    link = split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
      },
      wsLink,
      link,
    )
  }
  const config = {
    link,
    cache: new InMemoryCache({ fragmentMatcher }),
  }
  return new ApolloClient(makeConfig ? makeConfig(config) : config)
}

const Root = ({
  makeApolloConfig,
  routes,
  theme,
  connectToWebSocket = true,
}) => (
  <div>
    <ApolloProvider
      client={makeApolloClient(makeApolloConfig, connectToWebSocket)}
    >
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          {routes}
        </ThemeProvider>
      </BrowserRouter>
    </ApolloProvider>
  </div>
)

Root.defaultProps = {
  makeApolloConfig: config => config,
  connectToWebSocket: true,
}
Root.propTypes = {
  makeApolloConfig: PropTypes.func,
  routes: PropTypes.node.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  theme: PropTypes.object.isRequired,
  connectToWebSocket: PropTypes.bool,
}

export default Root
