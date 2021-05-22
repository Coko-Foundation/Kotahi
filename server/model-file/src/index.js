/* eslint-disable global-require */

const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')

module.exports = {
  models: [{ modelName: 'File', model: require('./file') }],
  resolvers,
  typeDefs,
}
