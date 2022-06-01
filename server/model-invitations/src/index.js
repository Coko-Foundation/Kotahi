const model = require('./invitations')
const graphql = require('./graphql')
const resolvers = require('./graphql')

module.exports = {
  model,
  modelName: 'Invitation',
  resolvers,
  ...graphql,
}
