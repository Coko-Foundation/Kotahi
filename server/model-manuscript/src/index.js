const graphql = require('./graphql')
const model = require('./manuscript')

module.exports = {
  model,
  modelName: 'Manuscript',
  ...graphql,
}
