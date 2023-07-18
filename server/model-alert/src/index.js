const model = require('./alert')
const graphql = require('./graphql')
const resolvers = require('./graphql')

module.exports = {
  model,
  modelName: 'Alert',
  resolvers,
  ...graphql,
}
