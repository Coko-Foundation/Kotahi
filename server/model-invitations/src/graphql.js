const models = require('@pubsweet/models')

const resolvers = {
  Query: {
    async invitationManuscriptId(_, { id }, ctx) {
      const invitation = await models.Invitation.query().findById(id)
      return invitation
    },
  },
  // Mutation: {
  //   async updateInvitationStatus(_, { id }, ctx) {
  //     const results = await models.Invitation.
  //   },
  // },
}

// restructure the manuscript ID on the dashboard page

const typeDefs = `
type Invitation {
    id: ID
    created: DateTime!
    updated: DateTime
    manuscriptId: ID!
    purpose: String!
    toEmail: String!
    status: String!
    senderId: ID
  }

extend type Query {
  invitationManuscriptId(id: ID): Invitation
}

extend type Mutation {
  updateInvitationStatus(id: ID, status: String): Boolean
}
`

module.exports = { resolvers, typeDefs }
