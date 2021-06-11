/* eslint-disable global-require */

module.exports = {
  ...require('./graphql'),
  models: [
    { modelName: 'Channel', model: require('./channel') },
    { modelName: 'ChannelMember', model: require('./channel_member') },
  ],
}
