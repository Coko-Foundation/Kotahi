/* eslint-disable global-require */

module.exports = {
  ...require('./graphql'),
  modelName: 'Message',
  model: require('./message'),
}
