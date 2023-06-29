const model = require('./emailTemplate')
const graphql = require('./graphql')
const resolvers = require('./graphql')

module.exports = {
  model,
  modelName: 'EmailTemplate',
  resolvers,
  ...graphql,
}
