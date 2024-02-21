/* eslint-disable global-require */

const graphql = require('./graphql')

module.exports = {
  ...graphql,
  models: [{ modelName: 'Review', model: require('./review') }],
}
