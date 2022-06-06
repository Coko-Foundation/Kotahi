const models = require('@pubsweet/models')

const resolvers = {
  Query: {
    async invitationManuscriptId(_, { id }, ctx) {
      const invitation = await models.Invitation.query().findById(id)
      return invitation
    },
    async invitationStatus(_, { id }, ctx) {
      const invitation = await models.Invitation.query().findById(id)
      return invitation
    },
  },
  Mutation: {
    async updateInvitationStatus(_, { id, status }, ctx) {
      const result = await models.Invitation.query().updateAndFetchById(id, {
        status,
      })

      return result
    },
  },
}

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
  invitationStatus(id: ID): Invitation
}

extend type Mutation {
  updateInvitationStatus(id: ID, status: String): Invitation
}
`

module.exports = { resolvers, typeDefs }
