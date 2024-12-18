const sendNotification = require('../../services/notification/sendNotification')

const jobQueues = [
  {
    name: 'notification-queue',
    handler: sendNotification,
  },
]

module.exports = jobQueues
