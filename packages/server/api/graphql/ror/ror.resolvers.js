const { searchRor } = require('../../../controllers/ror.controllers')

const rorResolver = async (_, { input }) => {
  return searchRor(input)
}

const resolvers = {
  Query: {
    searchRor: rorResolver,
  },
}

module.exports = resolvers
