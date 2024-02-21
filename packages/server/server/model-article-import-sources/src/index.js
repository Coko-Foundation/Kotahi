const model = require('./articleImportSources')
const graphql = require('./graphql')

module.exports = {
  model,
  modelName: 'ArticleImportSources',
  ...graphql,
}
