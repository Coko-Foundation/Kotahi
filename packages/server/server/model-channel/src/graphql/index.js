const Channel = require('../../../../models/channel/channel.model')

const { updateChannelLastViewed } = require('../channelCommsUtils')

const resolvers = {
  Query: {
    systemWideDiscussionChannel: async (_, { groupId }) =>
      Channel.query()
        .whereNull('manuscriptId')
        .where({ topic: 'System-wide discussion', groupId })
        .first(),
  },
  Mutation: {
    channelViewed: async (_, { channelId }, context) => {
      return updateChannelLastViewed({ channelId, userId: context.userId })
    },
  },
}

const typeDefs = `
  type Channel {
    id: String
    manuscript: Manuscript
    topic: String
    type: String
    team: Team
  }

  extend type Team {
    channels: [Channel]
  }

  type ChannelMember {
    id: ID!
    channelId: ID!
    userId: ID!
    lastViewed: DateTime
    lastAlertTriggeredTime: DateTime
  }

  extend type Query {
    systemWideDiscussionChannel(groupId: ID!): Channel!
    updateChannelLastViewed: Channel!
  }

  extend type Mutation {
    channelViewed(channelId: ID!): ChannelMember
  }
`

module.exports = { typeDefs, resolvers }
