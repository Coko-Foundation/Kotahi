/* eslint-disable global-require */

module.exports = {
  ...require('./graphql'),
  modelName: 'User',
  models: [
    { modelName: 'User', model: require('./user') },
    { modelName: 'Identity', model: require('./identity') },
  ],
}
