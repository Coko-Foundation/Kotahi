const {
  notificationOption,
  reportUserIsActive,
  updateNotificationOption,
} = require('../../../controllers/notificationUserOption.controllers')

module.exports = {
  Query: {
    notificationOption: async (_, { path }, ctx) => {
      const groupId = ctx.req.headers['group-id']
      return notificationOption(ctx.userId, groupId, path)
    },
  },
  Mutation: {
    updateNotificationOption: async (_, { path, option }, ctx) => {
      const groupId = ctx.req.headers['group-id']
      return updateNotificationOption(ctx.userId, groupId, path, option)
    },
    reportUserIsActive: async (_, { path }) => {
      return reportUserIsActive(path)
    },
  },
}
