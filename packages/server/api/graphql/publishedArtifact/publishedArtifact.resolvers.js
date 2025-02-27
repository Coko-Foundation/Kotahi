const { PublishedArtifact } = require('../../../models')

module.exports = {
  Query: {
    // REFACTOR: not used by client, maybe by flax?
    async publishedArtifacts(_, { manuscriptId }, ctx) {
      return PublishedArtifact.query().where({ manuscriptId })
    },
  },
}
