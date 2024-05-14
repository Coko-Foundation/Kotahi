const graphql = require('./graphql')
const resolvers = require('./graphql')

module.exports = {
  resolvers,
  ...graphql,
}
