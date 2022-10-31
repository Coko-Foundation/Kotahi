const { getConfigJsonString } = require('./configObject')

const resolvers = {
  Query: {
    config: async () => getConfigJsonString(),
  },
}

const typeDefs = `
  extend type Query {
    config: String!
  }
`

module.exports = { typeDefs, resolvers }
