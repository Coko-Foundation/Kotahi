const { pubsubManager } = require('@coko/server')

const { getPubsub } = pubsubManager

// Fires immediately when the message is created
const MESSAGE_CREATED = 'MESSAGE_CREATED'

const Message = require('./message')

const resolvers = {
  Query: {
    message: async (_, { messageId }) => {
      Message.find(messageId)
    },
    messages: async (_, { channelId, first = 20, before }) => {
      let messagesQuery = Message.query()
        .where({ channelId })
        .withGraphJoined('user')
        .limit(first)
        .orderBy('messages.created', 'desc')

      if (before) {
        const firstMessage = await Message.query().findById(before)
        messagesQuery = messagesQuery.where(
          'messages.created',
          '<',
          firstMessage.created,
        )
      }

      const messages = (await messagesQuery).reverse()
      const total = await messagesQuery.resultSize()

      return {
        edges: messages,
        pageInfo: {
          startCursor: messages[0] && messages[0].id,
          hasPreviousPage: total > first,
        },
      }
    },
  },
  Mutation: {
    createMessage: async (_, { content, channelId }, context) => {
      const pubsub = await getPubsub()
      const userId = context.user

      const savedMessage = await new Message({
        content,
        userId,
        channelId,
      }).save()

      const message = await Message.query()
        .findById(savedMessage.id)
        .withGraphJoined('user')

      pubsub.publish(`${MESSAGE_CREATED}.${channelId}`, message.id)

      return message
    },
  },
  Subscription: {
    messageCreated: {
      resolve: async (messageId, _, context) => {
        const message = await Message.query()
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
