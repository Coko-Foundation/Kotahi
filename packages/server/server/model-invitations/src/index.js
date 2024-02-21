const Invitation = require('./invitations')
const BlacklistEmail = require('./blacklist_email')
const graphql = require('./graphql')
const resolvers = require('./graphql')

module.exports = {
  resolvers,
  ...graphql,
  models: [
    { modelName: 'Invitation', model: Invitation },
    { modelName: 'BlacklistEmail', model: BlacklistEmail },
  ],
}
