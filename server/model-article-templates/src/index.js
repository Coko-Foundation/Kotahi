/* eslint-disable global-require */
const model = require('./articleTemplate')

module.exports = {
  model,
  modelName: 'ArticleTemplate',
  ...require('./graphql'),
}
