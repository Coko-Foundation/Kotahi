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

const seekEvent = require('../../../services/notification.service')

const resolvers = {
  Query: {
    async invitationManuscriptId(_, { id }, ctx) {
      const invitation = await Invitation.query().findById(id)
      return invitation
    },
    async invitationStatus(_, { id }, ctx) {
      const invitation = await Invitation.query().findById(id).throwIfNotFound()

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
    async removeInvitation(_, { id }) {
      const invitation = await Invitation.query().findById(id)
      if (!invitation) return null

      await Invitation.query().findById(id).delete()
      return invitation
    },
    async updateInvitationStatus(_, { id, status, userId, responseDate }, ctx) {
      const groupId = ctx.req.headers['group-id']

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

      const { invitedPersonType } = result
      const type = invitedPersonType.toLowerCase()

      if (relatedUser) {
        await Team.relatedQuery('members')
          .for(
            Team.query().findOne({
              objectId: result.manuscriptId,
              // TODO this is a temporary solution until we have a proper
              // solution for status with CAPITAL and UNDERSCORES.
              role: type.replace(
                'collaborative_reviewer',
                'collaborativeReviewer',
              ),
            }),
          )
          .patch({ status: status.toLowerCase() })
          .where({ userId: relatedUser.id, status: 'invited' })
      }

      const manuscript = await Manuscript.query().findById(result.manuscriptId)

      const eventName = {
        author: 'author',
        reviewer: 'review',
        collaborative_reviewer: 'collaborative-review',
      }[type]

      seekEvent(`${eventName}-${status.toLowerCase()}`, {
        manuscript,
        status,
        userId,
        responseDate,
        context: {
          invitation: result,
          reviewerId: userId,
          recipient: 'handlingEditor',
        },
        groupId,
      })

      return result
    },
    async updateInvitationResponse(
      _,
      { id, responseComment, declinedReason, suggestedReviewers },
      ctx,
    ) {
      const result = await Invitation.query().updateAndFetchById(id, {
        responseComment,
        declinedReason,
        suggestedReviewers: suggestedReviewers || [],
      })

      return result
    },
    async addEmailToBlacklist(_, { email, groupId }, ctx) {
      const result = await BlacklistEmail.query().insert({ email, groupId })

      return result
    },
    async assignUserAsAuthor(_, { manuscriptId, userId, invitationId }, ctx) {
      const existingInvite = await Invitation.query().findById(invitationId)

      if (!existingInvite || existingInvite.responseDate) {
        throw new Error('Invalid Invitation ID')
      }

      if (existingInvite.userId && existingInvite.userId !== userId) {
        throw new Error('Invalid User ID')
      }

      await addUserToManuscriptChatChannel({
        manuscriptId,
        userId,
      })

      const existingTeam = await Manuscript.relatedQuery('teams')
        .for(manuscriptId)
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
          await TeamMember.query().insert({
            teamId: existingTeam.id,
            userId,
          })
        }

        return existingTeam.$query().withGraphFetched('members.[user]')
      }

      // Create a new team of authors if it doesn't exist
      const newTeam = await Team.query().insert({
        objectId: manuscriptId,
        objectType: 'manuscript',
        role: 'author',
        displayName: 'Author',
      })

      await TeamMember.query().insert({
        userId,
        teamId: newTeam.id,
      })

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
type SuggestedReviewer {
  firstName: String
  lastName: String
  email: String
  affiliation: String
}

input SuggestedReviewerInput {
  firstName: String
  lastName: String
  email: String
  affiliation: String
}

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
  suggestedReviewers: [SuggestedReviewer]!
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
  updateInvitationResponse(id: ID,  responseComment: String,  declinedReason: String, suggestedReviewers:[SuggestedReviewerInput]): Invitation
  addEmailToBlacklist(email: String!, groupId: ID!): BlacklistEmail
  assignUserAsAuthor(manuscriptId: ID!, userId: ID!, invitationId: ID!): Team
  updateSharedStatusForInvitedReviewer(invitationId: ID!, isShared: Boolean!): Invitation!
  removeInvitation(id: ID!): Invitation
}
`

module.exports = { resolvers, typeDefs }
