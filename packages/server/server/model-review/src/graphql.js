const isEmpty = require('lodash/isEmpty')
const omit = require('lodash/omit')
const { File, subscriptionManager } = require('@coko/server')
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

const seekEvent = require('../../../services/notification.service')

const resolvers = {
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      const reviewDelta = { jsonData: {}, ...input }
      const existingReview = (await Review.query().findById(id)) || {}

      const manuscript = await Manuscript.query()
        .findById(existingReview.manuscriptId || input.manuscriptId)
        .select('groupId')

      const form = existingReview.isDecision
        ? await getDecisionForm(manuscript.groupId)
        : await getReviewForm(manuscript.groupId)

      const roles = await getUserRolesInManuscript(
        existingReview.userId || ctx.userId,
        existingReview.manuscriptId || input.manuscriptId,
      )

      const reviewUserId = !isEmpty(existingReview)
        ? existingReview.userId
        : ctx.userId

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

      subscriptionManager.publish(`${REVIEW_FORM_UPDATED}_${review.id}`, {
        reviewFormUpdated: omit(returnedReview, ['jsonData']),
      })

      return returnedReview
    },

    async lockUnlockCollaborativeReview(_, { id }) {
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

      const team = await Team.query().findOne({
        role: 'collaborativeReviewer',
        objectId: updatedReview.manuscriptId,
        objectType: 'manuscript',
      })

      const status = updatedReview.isLock ? 'closed' : 'inProgress'
      await TeamMember.query()
        .patch({ status })
        .where({ teamId: team.id })
        .andWhere(builder => {
          builder.whereIn('status', ['closed', 'inProgress'])
        })

      const manuscript = await Manuscript.query().findById(
        updatedReview.manuscriptId,
      )

      const eventParam = updatedReview.isLock ? 'lock' : 'unlock'

      seekEvent(`collaborative-review-${eventParam}`, {
        manuscript,
        groupId: manuscript.groupId,
      })
      const form = await getReviewForm(manuscript.groupId)

      await convertFilesToFullObjects(
        updatedReview,
        form,
        async ids => File.query().findByIds(ids),
        getFilesWithUrl,
      )

      subscriptionManager.publish(`${REVIEW_FORM_UPDATED}_${review.id}`, {
        reviewFormUpdated: omit(updatedReview, ['jsonData']),
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
        .andWhere({ userId: ctx.userId })
        .first()

      if (status === 'completed') {
        seekEvent(`review-completed`, {
          manuscript,
          groupId: manuscript.groupId,
        })
      }

      return member.$query().patchAndFetch({
        status,
        updated: new Date().toISOString(),
      })
    },
  },
  Review: {
    async user(parent, { id }, ctx) {
      if (parent.user) return parent.user

      // TODO redact user if it's an anonymous review and ctx.userId is not editor or admin
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
          builder
            .where({ status: 'completed' })
            .orWhere({ userId: ctx.userId }),
        )

      if (sharedMembers.some(m => m.userId === ctx.userId)) return true
      return false
    },
  },
  Subscription: {
    reviewFormUpdated: {
      subscribe: async (_, { formId }) => {
        return subscriptionManager.asyncIterator(
          `${REVIEW_FORM_UPDATED}_${formId}`,
        )
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
