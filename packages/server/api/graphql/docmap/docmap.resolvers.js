const { docmap } = require('../../../controllers/docmap.controllers')

module.exports = {
  Query: {
    async docmap(_, { externalId, groupName }) {
      return docmap(externalId, groupName)
    },
  },
}
