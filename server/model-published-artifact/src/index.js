const graphql = require('./graphql')
const model = require('./publishedArtifact')

module.exports = {
  model,
  modelName: 'PublishedArtifact',
  ...graphql,
}
