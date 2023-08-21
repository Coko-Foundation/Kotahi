const { pubsubManager } = require('@coko/server')

const { getPubsub } = pubsubManager

// Fires immediately when the message is created
const MESSAGE_CREATED = 'MESSAGE_CREATED'

const models = require('@pubsweet/models')

const {
  updateChannelLastViewed,
  getChannelMemberByChannel,
  addUserToChatChannel,
} = require('../../model-channel/src/channelCommsUtils')

const {
  notify,
} = require('../../model-notification/src/notificationCommsUtils')

const resolvers = {
  Query: {
    message: async (_, { messageId }) => {
      models.Message.find(messageId)
    },
    messages: async (_, { channelId, first = 20, before }, context) => {
      let messagesQuery = models.Message.query()
        .where({ channelId })
        .withGraphJoined('user')
        .limit(first)
        .orderBy('messages.created', 'desc')

      if (before) {
        const firstMessage = await models.Message.query().findById(before)
        messagesQuery = messagesQuery.where(
          'messages.created',
          '<',
          firstMessage.created,
        )
      }

      const messages = (await messagesQuery).reverse()
      const total = await messagesQuery.resultSize()

      const channelMember = await getChannelMemberByChannel({
        channelId,
        userId: context.user,
      })

      let unreadMessagesCount = [{ count: 0 }]
      let firstUnreadMessage = null

      if (channelMember) {
        unreadMessagesCount = await models.Message.query()
          .where({ channelId })
          .where('created', '>', channelMember.lastViewed)
          .count()

        firstUnreadMessage = await models.Message.query()
          .select('id')
          .where({ channelId })
          .where('created', '>', channelMember.lastViewed)
          .orderBy('created', 'asc')
          .first()
      }

      await updateChannelLastViewed({ channelId, userId: context.user })
      return {
        edges: messages,
        pageInfo: {
          startCursor: messages[0] && messages[0].id,
          hasPreviousPage: total > first,
        },
        unreadMessagesCount: unreadMessagesCount[0].count,
        firstUnreadMessageId: firstUnreadMessage?.id,
      }
    },
  },
  Mutation: {
    createMessage: async (_, { content, channelId }, context) => {
      const pubsub = await getPubsub()
      const userId = context.user

      const savedMessage = await new models.Message({
        content,
        userId,
        channelId,
      }).save()

      const message = await models.Message.query()
        .findById(savedMessage.id)
        .withGraphJoined('[user, channel]')

      pubsub.publish(`${MESSAGE_CREATED}.${channelId}`, message.id)

      await addUserToChatChannel({ channelId, userId })

      const channelMembers = await models.ChannelMember.query()
        .where({
          channelId: message.channelId,
        })
        .whereNot({ userId: message.userId })
        .withGraphJoined('user')

      notify(['chat', message.channelId], {
        time: message.created,
        context: { messageId: message.id },
        users: channelMembers.map(channelMember => channelMember.user),
        groupId: message.channel.groupId,
      })

      return message
    },
  },
  Subscription: {
    messageCreated: {
      resolve: async (messageId, _, context) => {
        const message = await models.Message.query()
          .findById(messageId)
          .withGraphJoined('user')

        return message
      },
      subscribe: async (_, vars, context) => {
        const pubsub = await getPubsub()
        return pubsub.asyncIterator(`${MESSAGE_CREATED}.${vars.channelId}`)
      },
    },
  },
}

const typeDefs = `
  type Message {
    content: String
    user: User
    id: String
    created: DateTime
    updated: DateTime
  }

  type PageInfo {
    startCursor: String
    hasPreviousPage: Boolean
    hasNextPage: Boolean
  }

  type MessagesRelay {
    edges: [Message]
    pageInfo: PageInfo
    unreadMessagesCount: Int
    firstUnreadMessageId: ID
  }

  extend type Query {
    message(messageId: ID): Message
    messages(channelId: ID, first: Int, after: String, before: String): MessagesRelay
  }

  extend type Mutation {
    createMessage(content: String, channelId: String, userId: String): Message
  }

  extend type Subscription {
    messageCreated(channelId: ID): Message
  }
`

module.exports = { typeDefs, resolvers }
