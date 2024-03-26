/* eslint-disable no-param-reassign */
import React from 'react'
import PropTypes from 'prop-types'
import { ApolloProvider, ApolloClient, ApolloLink, split } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'
// import { ApolloClient } from 'apollo-client'
import { WebSocketLink } from '@apollo/client/link/ws'
// import { split, ApolloLink } from 'apollo-link'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { InMemoryCache } from '@apollo/client/cache'
import { createUploadLink } from 'apollo-upload-client'
import Pages from './Pages'

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

  const groupLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'group-id': localStorage.getItem('groupId') || null,
      },
    }
  })

  const removeTypename = new ApolloLink((operation, forward) => {
    if (operation.variables) {
      operation.variables = stripTypenames(operation.variables)
    }

    return forward(operation)
  })

  let link = ApolloLink.from([removeTypename, authLink, groupLink, uploadLink])

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
        File: {
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

const Root = ({ makeApolloConfig, connectToWebSocket = true }) => {
  return (
    <div style={{ width: '100%' }}>
      <ApolloProvider
        client={makeApolloClient(makeApolloConfig, connectToWebSocket)}
      >
        <BrowserRouter>
          <Pages />
        </BrowserRouter>
      </ApolloProvider>
    </div>
  )
}

Root.defaultProps = {
  makeApolloConfig: config => config,
  connectToWebSocket: true,
}
Root.propTypes = {
  makeApolloConfig: PropTypes.func,
  connectToWebSocket: PropTypes.bool,
}

export default Root
