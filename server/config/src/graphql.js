const Config = require('./config')
const { getConfigJsonString } = require('./configObject')

const redact = str => {
  return str && str.replace(/./g, '*')
}

const hideSensitiveInformation = async configData => {
  const config = configData

  // Publishing - Crossref password
  if (config.formData.publishing.crossref.password)
    config.formData.publishing.crossref.password = redact(
      config.formData.publishing.crossref.password,
    )

  // Notifications - Gmail password
  if (config.formData.notification.gmailAuthPassword)
    config.formData.notification.gmailAuthPassword = redact(
      config.formData.notification.gmailAuthPassword,
    )

  return config
}

const revertHiddenSensitiveInformation = async inputFormData => {
  const existingConfig = await Config.query().first()
  const formData = inputFormData

  // Publishing - Crossref password
  if (formData.publishing.crossref.password) {
    const passwordIsHidden =
      redact(existingConfig.formData.publishing.crossref.password) ===
      formData.publishing.crossref.password

    if (passwordIsHidden)
      formData.publishing.crossref.password =
        existingConfig.formData.publishing.crossref.password
  }

  // Notifications - Gmail password
  if (formData.notification.gmailAuthPassword) {
    const gmailAuthPasswordIsHidden =
      redact(existingConfig.formData.notification.gmailAuthPassword) ===
      formData.notification.gmailAuthPassword

    if (gmailAuthPasswordIsHidden)
      formData.notification.gmailAuthPassword =
        existingConfig.formData.notification.gmailAuthPassword
  }

  return formData
}

const resolvers = {
  Query: {
    config: async (_, { id }, ctx) => {
      let config = await Config.query().first()
      config = await hideSensitiveInformation(config)
      config.formData = JSON.stringify(config.formData)
      return config
    },
    oldConfig: async () => getConfigJsonString(),
  },
  Mutation: {
    updateConfig: async (_, { id, input }) => {
      const inputFormData = JSON.parse(input.formData)
      const formData = await revertHiddenSensitiveInformation(inputFormData)

      const configInput = {
        formData,
        active: input.active,
      }

      let config = await Config.query().updateAndFetchById(id, configInput)
      config = await hideSensitiveInformation(config)
      config.formData = JSON.stringify(config.formData)
      return config
    },
  },
}

const typeDefs = `
  extend type Query {
    config(id: ID): Config
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
  }

  input ConfigInput {
    formData: String!
    active: Boolean!
  }
`

module.exports = { typeDefs, resolvers }
