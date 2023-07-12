/* eslint-disable global-require */
const model = require('./group')

module.exports = {
  model,
  modelName: 'Group',
  ...require('./graphql'),
}
