/* eslint-disable no-param-reassign */
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import { ApolloProvider, ApolloClient, ApolloLink, split } from '@apollo/client'
// import { ApolloClient } from 'apollo-client'
import { WebSocketLink } from '@apollo/client/link/ws'
// import { split, ApolloLink } from 'apollo-link'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { InMemoryCache } from '@apollo/client/cache'
import { createUploadLink } from 'apollo-upload-client'

import GlobalStyle from './theme/elements/GlobalStyle'
import currentRolesVar from './shared/currentRolesVar'

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
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            tasks: {
              merge(existing, incoming) {
                return incoming
              },
            },
          },
        },
        ManuscriptMeta: {
          keyFields: ['manuscriptId'],
        },
        Manuscript: {
          fields: {
            _currentRoles: {
              read(existing, { cache, args, readField }) {
                const currentRoles = currentRolesVar()
                const currentId = readField('id')
                const r = currentRoles.find(ro => ro.id === currentId)
                return (r && r.roles) || []
              },
            },
            formFieldsToPublish: {
              merge(existing, incoming) {
                return incoming
              },
            },
            tasks: {
              merge(existing, incoming) {
                return incoming
              },
            },
          },
        },
        ThreadedDiscussion: {
          fields: {
            threads: {
              merge(existing, incoming) {
                return incoming
              },
            },
          },
        },
        DiscussionThread: {
          fields: {
            comments: {
              merge(existing, incoming) {
                return incoming
              },
            },
          },
        },
        ThreadComment: {
          fields: {
            commentVersions: {
              merge(existing, incoming) {
                return incoming
              },
            },
          },
        },
        User: {
          fields: {
            teams: {
              merge(existing, incoming) {
                return incoming
              },
            },
          },
        },
        CurrentRole: {
          fields: {
            roles: {
              merge(existing, incoming) {
                return incoming
              },
            },
          },
        },
      },
    }),
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
