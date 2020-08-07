const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const model = require('./review_comment')

module.exports = {
  model,
  modelName: 'ReviewComment',
  resolvers,
  typeDefs,
}
