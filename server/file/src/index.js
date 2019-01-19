const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const model = require('./file')

module.exports = {
  model,
  modelName: 'File',
  resolvers,
  typeDefs,
}
