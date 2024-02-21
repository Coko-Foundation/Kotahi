const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const model = require('./form')

module.exports = {
  model,
  modelName: 'Form',
  resolvers,
  typeDefs,
}
