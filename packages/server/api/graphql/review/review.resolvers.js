const omit = require('lodash/omit')

const { subscriptionManager } = require('@coko/server')

const REVIEW_FORM_UPDATED = 'REVIEW_FORM_UPDATED'

const {
  isReviewSharedWithCurrentUser,
  lockUnlockCollaborativeReview,
  reviewUser,
  updateReview,
  updateReviewerTeamMemberStatus,
} = require('../../../controllers/review.controllers')

module.exports = {
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      const updatedReview = await updateReview(id, input, ctx.userId)

      subscriptionManager.publish(`${REVIEW_FORM_UPDATED}_${id}`, {
        reviewFormUpdated: omit(updateReview, ['jsonData']),
      })

      return updatedReview
    },

    async lockUnlockCollaborativeReview(_, { id }) {
      const updatedReview = await lockUnlockCollaborativeReview(id)

      subscriptionManager.publish(`${REVIEW_FORM_UPDATED}_${id}`, {
        reviewFormUpdated: omit(updatedReview, ['jsonData']),
      })

      return updatedReview
    },

    async updateReviewerTeamMemberStatus(_, { manuscriptId, status }, ctx) {
      return updateReviewerTeamMemberStatus(manuscriptId, status, ctx.userId)
    },
  },
  Review: {
    async user(parent) {
      return reviewUser(parent)
    },

    async isSharedWithCurrentUser(parent, _, ctx) {
      return isReviewSharedWithCurrentUser(parent, ctx.userId)
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
