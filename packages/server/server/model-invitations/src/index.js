const graphql = require('./graphql')
const resolvers = require('./graphql')

// REFACTOR: GRAPHQL

module.exports = {
  resolvers,
  ...graphql,
}
