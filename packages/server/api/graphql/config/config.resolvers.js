const {
  getConfig,
  getIcon,
  getLogo,
  getOldConfig,
  translationOverrides,
  updateConfig,
} = require('../../../controllers/config/config.controllers')

module.exports = {
  Query: {
    config: async (_, { id }) => {
      return getConfig(id)
    },
    oldConfig: () => {
      return getOldConfig()
    },
  },
  Mutation: {
    updateConfig: async (_, { id, input }) => {
      return updateConfig(id, input.formData, input.active)
    },
  },
  Config: {
    icon: async parent => getIcon(parent),
    logo: async parent => getLogo(parent),
    translationOverrides: async parent => translationOverrides(parent.groupId),
  },
}
