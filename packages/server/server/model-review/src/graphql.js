const isEmpty = require('lodash/isEmpty')

const { File } = require('@coko/server')

const { pubsubManager } = require('@coko/server')
const Review = require('../../../models/review/review.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const User = require('../../../models/user/user.model')
const Team = require('../../../models/team/team.model')
const TeamMember = require('../../../models/teamMember/teamMember.model')

const { getFilesWithUrl } = require('../../utils/fileStorageUtils')
const { deepMergeObjectsReplacingArrays } = require('../../utils/objectUtils')
const { getReviewForm, getDecisionForm } = require('./reviewCommsUtils')

const {
  getUserRolesInManuscript,
} = require('../../model-user/src/userCommsUtils')

const {
  convertFilesToIdsOnly,
  convertFilesToFullObjects,
} = require('./reviewUtils')

const { REVIEW_FORM_UPDATED } = require('./consts')

const resolvers = {
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      const pubsub = await pubsubManager.getPubsub()
      const reviewDelta = { jsonData: {}, ...input }
      const existingReview = (await Review.query().findById(id)) || {}

      const manuscript = await Manuscript.query()
        .findById(existingReview.manuscriptId || input.manuscriptId)
        .select('groupId')

      const form = existingReview.isDecision
        ? await getDecisionForm(manuscript.groupId)
        : await getReviewForm(manuscript.groupId)

      const roles = await getUserRolesInManuscript(
        existingReview.userId || ctx.user,
        existingReview.manuscriptId || input.manuscriptId,
      )

      const reviewUserId = !isEmpty(existingReview)
        ? existingReview.userId
        : ctx.user

      const userId = roles.collaborativeReviewer ? null : reviewUserId

      await convertFilesToIdsOnly(reviewDelta, form)

      const mergedReview = {
        canBePublishedPublicly: false,
        isHiddenFromAuthor: false,
        isHiddenReviewerName: false,
        isCollaborative: !!roles.collaborativeReviewer,
        ...deepMergeObjectsReplacingArrays(existingReview, reviewDelta),
        // Prevent reassignment of userId or manuscriptId:
        userId,
        manuscriptId: existingReview.manuscriptId || input.manuscriptId,
      }

      // Prevent reassignment of isDecision
      if (typeof existingReview.isDecision === 'boolean')
        mergedReview.isDecision = existingReview.isDecision

      // Ensure the following aren't null or undefined
      mergedReview.canBePublishedPublicly =
        !!mergedReview.canBePublishedPublicly
      mergedReview.isHiddenFromAuthor = !!mergedReview.isHiddenFromAuthor
      mergedReview.isHiddenReviewerName = !!mergedReview.isHiddenReviewerName

      const review = await Review.query().upsertGraphAndFetch(
        {
          id,
          ...mergedReview,
          jsonData: JSON.stringify(mergedReview.jsonData),
        },
        { insertMissing: true },
      )

      // We want to modify file URIs before return, so we'll use the parsed jsonData
      review.jsonData = mergedReview.jsonData

      const reviewUser = review.userId
        ? await User.query().findById(review.userId)
        : null

      await convertFilesToFullObjects(
        review,
        form,
        async ids => File.query().findByIds(ids),
        getFilesWithUrl,
      )

      const returnedReview = {
        id: review.id,
        created: review.created,
        updated: review.updated,
        isDecision: review.isDecision,
        open: review.open,
        user: reviewUser,
        isHiddenFromAuthor: review.isHiddenFromAuthor,
        isHiddenReviewerName: review.isHiddenReviewerName,
        isCollaborative: review.isCollaborative,
        isLock: review.isLock,
        canBePublishedPublicly: review.canBePublishedPublicly,
        jsonData: JSON.stringify(review.jsonData),
        manuscriptId: review.manuscriptId,
      }

      pubsub.publish(`${REVIEW_FORM_UPDATED}_${review.id}`, {
        reviewFormUpdated: returnedReview,
      })

      return returnedReview
    },

    async lockUnlockCollaborativeReview(_, { id }) {
      const pubsub = await pubsubManager.getPubsub()

      const review = await Review.query()
        .findOne({
          id,
          isCollaborative: true,
        })
        .throwIfNotFound()

      const updatedReview = await Review.query()
        .patch({ isLock: !review.isLock })
        .findOne({ id })
        .returning('*')

      const status = updatedReview.isLock ? 'closed' : 'inProgress'

      const team = await Team.query().findOne({
        role: 'collaborativeReviewer',
        objectId: updatedReview.manuscriptId,
        objectType: 'manuscript',
      })

      await TeamMember.query()
        .patch({ status })
        .where({ teamId: team.id })
        .andWhere(builder => {
          builder.whereIn('status', ['closed', 'inProgress'])
        })

      const manuscript = await Manuscript.query().findById(
        updatedReview.manuscriptId,
      )

      const form = await getReviewForm(manuscript.groupId)

      await convertFilesToFullObjects(
        updatedReview,
        form,
        async ids => File.query().findByIds(ids),
        getFilesWithUrl,
      )

      pubsub.publish(`${REVIEW_FORM_UPDATED}_${review.id}`, {
        reviewFormUpdated: updatedReview,
      })

      return {
        ...updatedReview,
        jsonData: JSON.stringify(updatedReview.jsonData),
      }
    },

    async updateReviewerTeamMemberStatus(_, { manuscriptId, status }, ctx) {
      const manuscript = await Manuscript.query()
        .findById(manuscriptId)
        .withGraphFetched('[submitter.defaultIdentity, channels.members]')

      const teams = await manuscript
        .$relatedQuery('teams')
        .whereIn('role', ['reviewer', 'collaborativeReviewer'])

      const member = await TeamMember.query()
        .whereIn(
          'teamId',
          teams.map(t => t.id),
        )
        .andWhere({ userId: ctx.user })
        .first()

      member.status = status
      member.updated = new Date().toISOString()
      return member.save()
    },
  },
  Review: {
    async user(parent, { id }, ctx) {
      if (parent.user) return parent.user

      // TODO redact user if it's an anonymous review and ctx.user is not editor or admin
      return parent.userId ? User.query().findById(parent.userId) : null
    },
    async isSharedWithCurrentUser(parent, _, ctx) {
      if (
        parent.isSharedWithCurrentUser ||
        parent.isSharedWithCurrentUser === false
      )
        return !!parent.isSharedWithCurrentUser

      const sharedMembers = await Team.relatedQuery('members')
        .for(
          Team.query().where({
            role: 'reviewer',
            objectId: parent.manuscriptId,
          }),
        )
        .where({ isShared: true })
        .where(builder =>
          builder.where({ status: 'completed' }).orWhere({ userId: ctx.user }),
        )

      if (sharedMembers.some(m => m.userId === ctx.user)) return true
      return false
    },
  },
  Subscription: {
    reviewFormUpdated: {
      subscribe: async (_, { formId }) => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(`${REVIEW_FORM_UPDATED}_${formId}`)
      },
    },
  },
}

const typeDefs = `
  extend type Mutation {
    updateReview(id: ID, input: ReviewInput): Review!
    updateReviewerTeamMemberStatus(manuscriptId: ID!, status: String): TeamMember
    lockUnlockCollaborativeReview(id: ID!): Review!
  }

  type Review {
    id: ID!
    created: DateTime!
    updated: DateTime
    isDecision: Boolean
    open: Boolean
    user: User
    isHiddenFromAuthor: Boolean
    isHiddenReviewerName: Boolean
    isSharedWithCurrentUser: Boolean!
    isCollaborative: Boolean!
    isLock: Boolean!
    canBePublishedPublicly: Boolean!
    jsonData: String
    userId: String
    files: [File]
  }

  input ReviewInput {
    isDecision: Boolean
    manuscriptId: ID!
    isHiddenFromAuthor: Boolean
    isHiddenReviewerName: Boolean
    canBePublishedPublicly: Boolean
    jsonData: String
    userId: String
  }

  extend type Subscription {
    reviewFormUpdated(formId: ID!): Review!
  }
`

module.exports = { resolvers, typeDefs }
