const Alert = require('./alert')

const resolvers = {
  Query: {
    alert: async (_, { id }, context) => {
      return Alert.find(id)
    },
    alerts: async (_, __, context) => {
      return [
        {
          title: 'hello',
        },
      ]
      // return Alert.all()
    },
  },
  Mutation: {
    createAlert: async (_, { messageId, userId }, context) => {
      const alert = await new Alert({
        title: 'hello',
        userId: 'hardcode',
        messageId: 'hardcode',
        triggerTime: 'hardcode',
        isSent: true,
      }).save()

      return alert
    },
  },
}

const typeDefs = `
  type Alert {
    id: ID
    title: String!
    user: User!
    message: Message
    triggerTime: DateTime
    isSent: Boolean!
  }

  extend type Query {
    alert(id: ID): Alert
    alerts: [Alert]
  }

  extend type Mutation {
    createAlert(messageId: ID, userId: ID): Alert
  }
`

module.exports = { typeDefs, resolvers }
