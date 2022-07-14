const { typeDefs, resolvers } = require('./graphql')
const model = require('./threadedDiscussion')

module.exports = {
  model,
  modelName: 'ThreadedDiscussion',
  resolvers,
  typeDefs,
}
