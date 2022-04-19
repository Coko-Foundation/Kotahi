const model = require('./invitations')
const graphql = require('./graphql')

module.exports = {
  model,
  modelName: 'Invitation',
  ...graphql,
}
