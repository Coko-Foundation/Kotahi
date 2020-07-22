const passport = require('passport')
const { ApolloServer } = require('apollo-server-express')
const isEmpty = require('lodash/isEmpty')
const logger = require('@pubsweet/logger')
const errors = require('@pubsweet/errors')
const config = require('config')
const { applyMiddleware } = require('graphql-middleware')

const schema = require('pubsweet-server/src/graphql/schema') // TODO: Fix import
const loaders = require('pubsweet-server/src/graphql/loaders') // TODO: Fix import

const authBearerAndPublic = passport.authenticate(['bearer', 'anonymous'], {
  session: false,
})

const helpers = require('pubsweet-server/src/helpers/authorization')

const hostname = config.has('pubsweet-server.hostname')
  ? config.get('pubsweet-server.hostname')
  : 'localhost'

const extraApolloConfig = config.has('pubsweet-server.apollo')
  ? config.get('pubsweet-server.apollo')
  : {}

const getUser = async userId => {
  const { User } = require('@pubsweet/models')
  return userId ? User.query().findById(userId) : undefined
}

const permissions = require('../config/permissions')

const api = app => {
  app.use('/graphql', authBearerAndPublic)
  const server = new ApolloServer({
    schema: applyMiddleware(schema, permissions),
    context: async ({ req, res }) => ({
      helpers,
      user: await getUser(req.user),
      loaders: loaders(),
      models: require('@pubsweet/models'),
    }),
    formatError: err => {
      const error = isEmpty(err.originalError) ? err : err.originalError

      logger.error(error.message, { error })

      const isPubsweetDefinedError = Object.values(errors).some(
        pubsweetError => error instanceof pubsweetError,
      )
      // err is always a GraphQLError which should be passed to the client
      if (!isEmpty(err.originalError) && !isPubsweetDefinedError)
        return {
          name: 'Server Error',
          message: 'Something went wrong! Please contact your administrator',
        }

      return {
        name: error.name || 'GraphQLError',
        message: error.message,
        extensions: {
          code: err.extensions.code,
        },
      }
    },
    playground: {
      subscriptionEndpoint: `ws://${hostname}:3000/subscriptions`,
    },
    ...extraApolloConfig,
  })
  server.applyMiddleware({ app })
}

module.exports = api
