const models = require('@pubsweet/models')
const BlacklistEmail = require('./blacklist_email')

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
    async getInvitationsForManuscript(_, { id }, ctx) {
      const invitations = await models.Invitation.query()
        .where({
          manuscriptId: id,
        })
        .withGraphFetched('[user]')

      return invitations
    },
  },
  Mutation: {
    async updateInvitationStatus(_, { id, status, userId }, ctx) {
      const result = await models.Invitation.query().updateAndFetchById(id, {
        status,
        userId,
      })

      return result
    },
    async updateInvitationResponse(
      _,
      { id, responseComment, responseDate, declinedReason },
      ctx,
    ) {
      const result = await models.Invitation.query().updateAndFetchById(id, {
        responseComment,
        responseDate,
        declinedReason,
      })

      return result
    },
    async addEmailToBlacklist(_, { email }, ctx) {
      const result = await new BlacklistEmail({ email }).save()

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
  senderId: ID!
  invitedPersonType: String!
  invitedPersonName: String!
  responseDate: DateTime
  responseComment: String
  declinedReason: String
  userId: ID
  user: User
}
type BlacklistEmail {
  id: ID
  created: DateTime
  updated: DateTime
  email: String!
}
extend type Query {
  invitationManuscriptId(id: ID): Invitation
  invitationStatus(id: ID): Invitation
  getInvitationsForManuscript(id: ID): [Invitation!]
}

extend type Mutation {
  updateInvitationStatus(id: ID, status: String, userId: ID): Invitation
  updateInvitationResponse(id: ID,  responseComment: String, responseDate: DateTime, declinedReason: String ): Invitation
  addEmailToBlacklist(email: String!): BlacklistEmail
}
`

module.exports = { resolvers, typeDefs }
