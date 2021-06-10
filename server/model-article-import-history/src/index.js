const model = require('./articleImportHistory')
const graphql = require('./graphql')

module.exports = {
  model,
  modelName: 'ArticleImportHistory',
  ...graphql,
}
