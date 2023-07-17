const Alert = require('./alert')

const resolvers = {
  Query: {
    alert: async (_, { id }, context) => {
      return Alert.find(id)
    },
    alerts: async (_, __, context) => {
      return Alert.all()
    },
  },
  Mutation: {
    createAlert: async (
      _,
      { input: { title, userId, messageId } },
      context,
    ) => {
      const alert = await new Alert({
        title,
        userId,
        messageId,
        triggerTime: new Date(),
        isSent: false,
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
    created: DateTime!
    updated: DateTime
  }

  input AlertInput {
    title: String!
    userId: ID!
    messageId: ID
  }

  extend type Query {
    alert(id: ID): Alert
    alerts: [Alert]
  }

  extend type Mutation {
    createAlert(input: AlertInput): Alert
  }
`

module.exports = { typeDefs, resolvers }
