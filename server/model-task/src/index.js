const model = require('./task')
const graphql = require('./graphql')
const resolvers = require('./graphql')

module.exports = {
  model,
  modelName: 'Task',
  resolvers,
  ...graphql,
}
