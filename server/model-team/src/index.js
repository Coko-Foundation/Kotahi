/* eslint-disable global-require */

module.exports = {
  ...require('./graphql'),
  models: [
    { modelName: 'Team', model: require('./team') },
    { modelName: 'TeamMember', model: require('./team_member') },
    { modelName: 'Alias', model: require('./alias') },
  ],
}
