const models = require('@pubsweet/models')
const { GraphQLError } = require('graphql')

const resolvers = {
  Query: {
    async docmap(_, { externalId, groupName = null }, ctx) {
      const groups = await models.Group.query().where({ isArchived: false })
      let group = null
      if (groupName) group = groups.find(g => g.name === groupName)
      else if (groups.length === 1) [group] = groups
      if (!group) throw new Error(`Group with name '${groupName}' not found`)

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
    docmap(externalId: String!, groupName: String): String!
  }
`

module.exports = { resolvers, typeDefs }
