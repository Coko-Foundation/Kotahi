const File = require('@coko/server/src/models/file/file.model')

const Config = require('../../../models/config/config.model')
const Group = require('../../../models/group/group.model')

const { getConfigJsonString } = require('./configObject')

const {
  hideSensitiveInformation,
  revertHiddenSensitiveInformation,
  rescheduleJobsOnChange,
} = require('../../utils/configUtils')

const { setFileUrls } = require('../../utils/fileStorageUtils')

const getFile = async (config, fieldName) => {
  try {
    const { groupIdentity } = JSON.parse(config.formData)
    const file = await File.findById(groupIdentity[fieldName])

    const updatedStoredObjects = await setFileUrls(file.storedObjects)

    file.storedObjects = updatedStoredObjects
    return file
  } catch (error) {
    return null
  }
}

const resolvers = {
  Query: {
    config: async (_, { id }, ctx) => {
      let config = await Config.query().findById(id)
      config = await hideSensitiveInformation(config)
      config.formData = JSON.stringify(config.formData)
      return config
    },
    oldConfig: async () => getConfigJsonString(),
  },
  Mutation: {
    updateConfig: async (_, { id, input }) => {
      const existingConfig = await Config.query().findById(id)
      const inputFormData = JSON.parse(input.formData)

      const formData = await revertHiddenSensitiveInformation(
        existingConfig,
        inputFormData,
      )

      const configInput = {
        formData,
        active: input.active,
      }

      let config = await Config.query().updateAndFetchById(id, configInput)
      await rescheduleJobsOnChange(existingConfig, config)
      config = await hideSensitiveInformation(config)
      config.formData = JSON.stringify(config.formData)
      return config
    },
  },

  Config: {
    async logo(parent) {
      const logo = getFile(parent, 'logoId')
      return logo
    },
    async icon(parent) {
      const icon = getFile(parent, 'favicon')
      return icon
    },
    translationOverrides: async ({ groupId }) => {
      const { name: groupName } = await Group.query().findById(groupId)

      let groupOverrides
      let globalOverrides

      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        groupOverrides = require(`../../../config/translation/${groupName}/translationOverrides`)
      } catch {
        groupOverrides = {}
      }

      try {
        // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
        globalOverrides = require('../../../config/translation/translationOverrides')
      } catch {
        globalOverrides = {}
      }

      return JSON.stringify({ groupOverrides, globalOverrides })
    },
  },
}

const typeDefs = `
  extend type Query {
    config(id: ID!): Config!
    oldConfig: String!
  }

  extend type Mutation {
    updateConfig(id: ID!, input: ConfigInput): Config!
  }

  type Config {
    id: ID!
    created: DateTime!
    updated: DateTime
    formData: String!
    active: Boolean!
    logo: File
    icon: File
    groupId: ID!
    flaxSiteUrl: String
	translationOverrides: String
  }

  input ConfigInput {
    formData: String!
    active: Boolean!
  }
`

module.exports = { typeDefs, resolvers }
