const graphql = require('./graphql')
const model = require('./docmap')

module.exports = {
  model,
  modelName: 'Docmap',
  ...graphql,
}
