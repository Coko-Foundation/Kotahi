const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const model = require('./journal')

module.exports = {
  model,
  modelName: 'Journal',
  resolvers,
  typeDefs,
}
