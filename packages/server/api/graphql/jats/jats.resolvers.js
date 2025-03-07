const { convertToJats } = require('../../../controllers/jats.controllers')

module.exports = {
  Query: {
    convertToJats: async (_, { manuscriptId }) => {
      return convertToJats(manuscriptId)
    },
  },
}
