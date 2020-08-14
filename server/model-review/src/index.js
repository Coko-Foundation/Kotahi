const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')

module.exports = {
  resolvers,
  typeDefs,
  models: [
    { modelName: 'Review', model: require('./review') },
    { modelName: 'ReviewComment', model: require('./review_comment') },
  ],
}
