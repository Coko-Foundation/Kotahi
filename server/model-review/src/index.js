/* eslint-disable global-require */

const graphql = require('./graphql')

module.exports = {
  ...graphql,
  models: [
    { modelName: 'Review', model: require('./review') },
    { modelName: 'ReviewComment', model: require('./review_comment') },
  ],
}
