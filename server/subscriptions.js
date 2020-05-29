/**
 * subscription (websocket) server for GraphQL
 */
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const logger = require('@pubsweet/logger')

const graphqlSchema = require('pubsweet-server/src/graphql/schema') // TODO: Fix import
const { token } = require('pubsweet-server/src/authentication') // TODO: Fix import

module.exports = {
  addSubscriptions: server => {
    const connectors = require('pubsweet-server/src/connectors')
    const helpers = require('pubsweet-server/src/helpers/authorization')

    const { User } = require('@pubsweet/models')
    SubscriptionServer.create(
      {
        schema: graphqlSchema,
        execute,
        subscribe,
        onConnect: async (connectionParams, webSocket, context) => {
          if (!connectionParams.authToken) {
            throw new Error('Missing auth token')
          }
          const addTocontext = await new Promise((resolve, reject) => {
            token.verify(connectionParams.authToken, (_, id) => {
              if (!id) {
                logger.info('Bad auth token')
                reject(new Error('Bad auth token'))
              }

              resolve({ user: id, connectors, helpers })
            })
          })
          console.log('I AM ALIVE!')
          // Record a user's online status
          await User.query()
            .update({ online: true })
            .where('id', addTocontext.user)
          return addTocontext
        },
        onDisconnect: async (webSocket, context) => {
          const initialContext = await context.initPromise
          // Record that a user is no longer online
          if (initialContext.user) {
            await User.query()
              .update({ online: false })
              .where('id', initialContext.user)
          }
        },
      },
      {
        server,
        path: '/subscriptions',
      },
    )
  },
}
