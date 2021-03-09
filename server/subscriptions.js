/**
 * subscription (websocket) server for GraphQL
 */
const { execute, subscribe } = require('graphql')
// eslint-disable-next-line import/no-extraneous-dependencies
const { SubscriptionServer } = require('subscriptions-transport-ws') // TODO: Should we rewrite subscriptions to use Apollo v2?

const logger = require('@pubsweet/logger')

const graphqlSchema = require('pubsweet-server/src/graphql/schema') // TODO: Fix import
const { token } = require('pubsweet-server/src/authentication') // TODO: Fix import

module.exports = {
  addSubscriptions: server => {
    /* eslint-disable global-require */
    const models = require('@pubsweet/models')
    const helpers = require('pubsweet-server/src/helpers/authorization')
    const { User } = require('@pubsweet/models')
    /* eslint-enable global-require */

    SubscriptionServer.create(
      {
        schema: graphqlSchema,
        execute,
        subscribe,
        onConnect: async (connectionParams, webSocket, context) => {
          if (!connectionParams.authToken) {
            logger.info('Missing auth token')
            return false // TODO Upgrade to Apollo 2 or 3 and throw instead of returning false
            // throw new Error('Missing auth token')
          }

          let addTocontext

          try {
            addTocontext = await new Promise((resolve, reject) => {
              token.verify(connectionParams.authToken, (_, id) => {
                if (!id) {
                  logger.info('Bad auth token')
                  reject(new Error('Bad auth token'))
                }

                resolve({ userId: id, models, helpers })
              })
            })
          } catch {
            return false // TODO: Upgrade to Apollo 2 or 3 and remove the try/catch block
          }

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
