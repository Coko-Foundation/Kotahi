/* eslint-disable global-require */

// REFACTOR: GRAPHQL

const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')

module.exports = {
  resolvers,
  typeDefs,
}
