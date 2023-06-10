/* eslint-disable global-require */

module.exports = {
  ...require('./graphql'),
  modelName: 'FlaxPage',
  models: [{ modelName: 'FlaxPage', model: require('./flaxPage') }],
}
