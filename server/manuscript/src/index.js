const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const model = require('./manuscript')

module.exports = {
  model,
  modelName: 'Manuscript',
  resolvers,
  typeDefs,
}
