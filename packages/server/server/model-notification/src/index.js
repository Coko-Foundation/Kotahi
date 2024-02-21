/* eslint-disable global-require */

module.exports = {
  ...require('./graphql'),
  models: [
    {
      modelName: 'NotificationUserOption',
      model: require('./notificationUserOption'),
    },
    { modelName: 'NotificationDigest', model: require('./notificationDigest') },
  ],
}
