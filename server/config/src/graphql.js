const models = require('@pubsweet/models')
const File = require('@coko/server/src/models/file/file.model')
const { getConfigJsonString } = require('./configObject')

const {
  hideSensitiveInformation,
  revertHiddenSensitiveInformation,
  rescheduleJobsOnChange,
} = require('../../utils/configUtils')

const { setFileUrls } = require('../../utils/fileStorageUtils')

const resolvers = {
  Query: {
    config: async (_, { id }, ctx) => {
      let config = await models.Config.query().findById(id)
      config = await hideSensitiveInformation(config)
      config.formData = JSON.stringify(config.formData)

      return config
    },
    oldConfig: async () => getConfigJsonString(),
  },
  Mutation: {
    updateConfig: async (_, { id, input }) => {
      const existingConfig = await models.Config.query().findById(id)
      const inputFormData = JSON.parse(input.formData)

      const formData = await revertHiddenSensitiveInformation(
        existingConfig,
        inputFormData,
      )

      const configInput = {
        formData,
        active: input.active,
      }

      let config = await models.Config.query().updateAndFetchById(
        id,
        configInput,
      )
      await rescheduleJobsOnChange(existingConfig, config)
      config = await hideSensitiveInformation(config)
      config.formData = JSON.stringify(config.formData)
      return config
    },
  },

  Config: {
    async logo(parent) {
      try {
        const { groupIdentity } = JSON.parse(parent.formData)

        if (!groupIdentity.logoId) return null
        const logoFile = await File.find(groupIdentity.logoId)

        const updatedStoredObjects = setFileUrls(logoFile.storedObjects)

        logoFile.storedObjects = updatedStoredObjects
        return logoFile
      } catch (error) {
        return null
      }
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
    groupId: ID!
  }

  input ConfigInput {
    formData: String!
    active: Boolean!
  }
`

module.exports = { typeDefs, resolvers }
