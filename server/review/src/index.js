const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const model = require('./review')

module.exports = {
  model,
  modelName: 'Review',
  resolvers,
  typeDefs,
}
