/* eslint-disable global-require */
const model = require('./config')

module.exports = {
  model,
  modelName: 'Config',
  ...require('./graphql'),
}
