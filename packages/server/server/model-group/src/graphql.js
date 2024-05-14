const Group = require('../../../models/group/group.model')

const { getConfigJsonString } = require('../../config/src/configObject')
const { stripSensitiveInformation } = require('../../utils/configUtils')

const resolvers = {
  Query: {
    group: async (_, { id }, ctx) => {
      return Group.query().findById(id)
    },
    groups: async (_, vars, ctx) => {
      return Group.query().where({ isArchived: false })
    },
    groupByName: async (_, { name }, ctx) => {
      const group = await Group.query().findOne({
        name,
      })

      if (!group) {
        throw new Error(`Group not found!`)
      } else if (group && group.isArchived) {
        throw new Error(`Group has been archived!`)
      }

      return group
    },
  },
  Group: {
    async configs(parent) {
      const configs =
        parent.configs || (await Group.relatedQuery('configs').for(parent.id))

      return configs.map(async config => {
        const strippedConfig = await stripSensitiveInformation(config)
        strippedConfig.formData = JSON.stringify(strippedConfig.formData)
        return strippedConfig
      })
    },
    async oldConfig(parent) {
      return getConfigJsonString()
    },
  },
}

const typeDefs = `
  extend type Query {
    group(id: ID!): Group!
    groups: [Group]!
    groupByName(name: String!): Group!
  }

  type Group {
    id: ID!
    created: DateTime!
    updated: DateTime
    name: String!
    isArchived: Boolean!
    oldConfig: String!
    configs: [Config!]!
  }

  input GroupInput {
    name: String!
  }
`

module.exports = { typeDefs, resolvers }
