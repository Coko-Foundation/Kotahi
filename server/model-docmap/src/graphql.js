const models = require('@pubsweet/models')
const { GraphQLError } = require('graphql')

const resolvers = {
  Query: {
    async docmap(_, { externalId, groupId = null }, ctx) {
      const groups = await models.Group.query()
      let group = null
      if (!groupId && groups.length === 1) [group] = groups
      if (groupId) group = groups.find(g => g.id === groupId)

      if (!group) throw new Error(`Group with ID ${groupId} not found`)
      if (group && group.isArchived) throw new Error(`Group has been archived`)

      const record = await models.Docmap.query().findOne({
        externalId,
        groupId: group.id,
      })

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
    docmap(externalId: String!, groupId: String): String!
  }
`

module.exports = { resolvers, typeDefs }
