const {
  getSystemWideDiscussionChannel,
  updateChannelLastViewed,
} = require('../../../controllers/channel.controllers')

module.exports = {
  Query: {
    systemWideDiscussionChannel: async (_, { groupId }) => {
      return getSystemWideDiscussionChannel(groupId)
    },
  },
  Mutation: {
    channelViewed: async (_, { channelId }, ctx) => {
      return updateChannelLastViewed(channelId, ctx.userId)
    },
  },
}
