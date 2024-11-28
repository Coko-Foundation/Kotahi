const {
  localContext,
} = require('../../../controllers/localContext/localContext.controller')

const localContextResolver = async (_, { input }) => {
  const { projectId, groupId } = input
  return localContext({ projectId, groupId })
}

module.exports = {
  Query: {
    searchLocalContext: localContextResolver,
  },
}
