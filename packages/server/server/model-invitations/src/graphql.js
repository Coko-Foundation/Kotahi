const Invitation = require('../../../models/invitation/invitation.model')
const BlacklistEmail = require('../../../models/blacklistEmail/blacklistEmail.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const User = require('../../../models/user/user.model')
const Team = require('../../../models/team/team.model')
const TeamMember = require('../../../models/teamMember/teamMember.model')

const {
  isLatestVersionOfManuscript,
} = require('../../model-manuscript/src/manuscriptCommsUtils')

const {
  addUserToManuscriptChatChannel,
} = require('../../model-channel/src/channelCommsUtils')

const resolvers = {
  Query: {
    async invitationManuscriptId(_, { id }, ctx) {
      const invitation = await Invitation.query().findById(id)
      return invitation
    },
    async invitationStatus(_, { id }, ctx) {
      const invitation = await Invitation.query().findById(id)

      const isLatestVersion = await isLatestVersionOfManuscript(
        invitation.manuscriptId,
      )

      if (!isLatestVersion) {
        invitation.status = 'EXPIRED'
      }

      return invitation
    },
    async getInvitationsForManuscript(_, { id }, ctx) {
      if (!id) return []

      const invitations = await Invitation.query()
        .where({
          manuscriptId: id,
        })
        .withGraphJoined('user')

      return invitations
    },
    async getBlacklistInformation(_, { email, groupId }, ctx) {
      const blacklistData = await BlacklistEmail.query().where({
        email,
        groupId,
      })

      return blacklistData
    },
    async getEmailInvitedReviewers(_, { manuscriptId }, ctx) {
      if (!manuscriptId) return []

      const invitedReviewer = await Invitation.query()
        .where({
          manuscriptId,
        })
        .whereNot('status', 'ACCEPTED')

      return invitedReviewer
    },
  },
  Mutation: {
    async updateInvitationStatus(_, { id, status, userId, responseDate }, ctx) {
      const [result] = await Invitation.query()
        .patch({
          status,
          userId,
          responseDate,
        })
        .where({ id, status: 'UNANSWERED' })
        .returning('*')

      const relatedUser = await User.query().findOne({
        email: result.toEmail,
      })

      if (relatedUser) {
        await Team.relatedQuery('members')
          .for(
            Team.query().findOne({
              objectId: result.manuscriptId,
              role: result.invitedPersonType.toLowerCase(),
            }),
          )
          .patch({ status: status.toLowerCase() })
          .where({ userId: relatedUser.id, status: 'invited' })
      }

      return result
    },
    async updateInvitationResponse(
      _,
      { id, responseComment, declinedReason },
      ctx,
    ) {
      const result = await Invitation.query().updateAndFetchById(id, {
        responseComment,
        declinedReason,
      })

      return result
    },
    async addEmailToBlacklist(_, { email, groupId }, ctx) {
      const result = await new BlacklistEmail({ email, groupId }).save()

      return result
    },
    async assignUserAsAuthor(_, { manuscriptId, userId }, ctx) {
      const manuscript = await Manuscript.query().findById(manuscriptId)

      await addUserToManuscriptChatChannel({
        manuscriptId,
        userId,
      })

      const existingTeam = await manuscript
        .$relatedQuery('teams')
        .where('role', 'author')
        .first()

      // Add the author to the existing team of authors
      if (existingTeam) {
        const authorExists =
          (await existingTeam
            .$relatedQuery('users')
            .where('users.id', userId)
            .resultSize()) > 0

        if (!authorExists) {
          await new TeamMember({
            teamId: existingTeam.id,
            userId,
          }).save()
        }

        return existingTeam.$query().withGraphFetched('members.[user]')
      }

      // Create a new team of authors if it doesn't exist
      const newTeam = await new Team({
        objectId: manuscriptId,
        objectType: 'manuscript',
        members: [{ userId }],
        role: 'author',
        name: 'Authors',
      }).saveGraph()

      return newTeam
    },

    async updateSharedStatusForInvitedReviewer(
      _,
      { invitationId, isShared },
      ctx,
    ) {
      const result = await Invitation.query().updateAndFetchById(invitationId, {
        isShared,
      })

      return result
    },
  },
  Invitation: {
    async user(parent) {
      return parent.user || User.query().findById(parent.userId)
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
  isShared: Boolean!
}

type BlacklistEmail {
  id: ID
  created: DateTime
  updated: DateTime
  email: String!
  groupId: ID!
}

extend type Query {
  invitationManuscriptId(id: ID): Invitation
  invitationStatus(id: ID): Invitation
  getInvitationsForManuscript(id: ID): [Invitation!]
  getBlacklistInformation(email: String!, groupId: ID!): [BlacklistEmail]
  getEmailInvitedReviewers(manuscriptId: ID!): [Invitation!]!
}

extend type Mutation {
  updateInvitationStatus(id: ID, status: String, userId: ID,  responseDate: DateTime ): Invitation
  updateInvitationResponse(id: ID,  responseComment: String,  declinedReason: String ): Invitation
  addEmailToBlacklist(email: String!, groupId: ID!): BlacklistEmail
  assignUserAsAuthor(manuscriptId: ID!, userId: ID!): Team
  updateSharedStatusForInvitedReviewer(invitationId: ID!, isShared: Boolean!): Invitation!
}
`

module.exports = { resolvers, typeDefs }
