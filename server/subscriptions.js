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
    const models = require('@pubsweet/models')
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

              resolve({ userId: id, models, helpers })
            })
          })
          console.log('I AM ALIVE!')
          // Record a user's online status
          const user = await User.query().updateAndFetchById(
            addTocontext.userId,
            { online: true },
          )

          addTocontext.user = user
          return addTocontext
        },
        onDisconnect: async (webSocket, context) => {
          const initialContext = await context.initPromise
          // Record that a user is no longer online
          if (initialContext.user && initialContext.user.id) {
            await User.query()
              .update({ online: false })
              .where('id', initialContext.user.id)
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
