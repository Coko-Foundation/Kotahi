const models = require('@pubsweet/models')
const { GraphQLError } = require('graphql')

const resolvers = {
  Query: {
    async docmap(_, { externalId }, ctx) {
      const record = await models.Docmap.query().findOne({ externalId })

      if (!record)
        throw new GraphQLError('Resource not found', {
          extensions: {
            code: 'BAD_USER_INPUT',
            argumentName: 'externalId',
          },
        })

      return JSON.stringify({
        ...JSON.parse(record.content),
        created: record.created,
        updated: record.updated,
      })
    },
  },
}

const typeDefs = `
  extend type Query {
    docmap(externalId: String!): String!
  }
`

module.exports = { resolvers, typeDefs }
