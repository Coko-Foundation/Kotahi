/* eslint-disable global-require */

module.exports = {
  ...require('./graphql'),
  modelName: 'PublishingCollection',
  model: require('./publishingCollection'),
}
