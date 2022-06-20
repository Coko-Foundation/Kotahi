const models = require('@pubsweet/models')
const File = require('@coko/server/src/models/file/file.model')
const { getFilesWithUrl } = require('../../utils/fileStorageUtils')
const { deepMergeObjectsReplacingArrays } = require('../../utils/objectUtils')
const { getReviewForm, getDecisionForm } = require('./reviewCommsUtils')

const {
  convertFilesToIdsOnly,
  convertFilesToFullObjects,
} = require('./reviewUtils')

const resolvers = {
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      const reviewDelta = { jsonData: {}, ...input }
      const existingReview = (await models.Review.query().findById(id)) || {}

      const form = existingReview.isDecision
        ? await getDecisionForm()
        : await getReviewForm()

      await convertFilesToIdsOnly(reviewDelta, form)

      const mergedReview = {
        canBePublishedPublicly: false,
        isHiddenFromAuthor: false,
        isHiddenReviewerName: false,
        ...deepMergeObjectsReplacingArrays(existingReview, reviewDelta),
        // Prevent reassignment of userId or manuscriptId:
        userId: existingReview.userId || ctx.user,
        manuscriptId: existingReview.manuscriptId || input.manuscriptId,
      }

      // Prevent reassignment of isDecision
      if (typeof existingReview.isDecision === 'boolean')
        mergedReview.isDecision = existingReview.isDecision

      // Ensure the following aren't null or undefined
      mergedReview.canBePublishedPublicly = !!mergedReview.canBePublishedPublicly
      mergedReview.isHiddenFromAuthor = !!mergedReview.isHiddenFromAuthor
      mergedReview.isHiddenReviewerName = !!mergedReview.isHiddenReviewerName

      const review = await models.Review.query().upsertGraphAndFetch(
        {
          id,
          ...mergedReview,
          jsonData: JSON.stringify(mergedReview.jsonData),
        },
        { insertMissing: true },
      )

      // We want to modify file URIs before return, so we'll use the parsed jsonData
      review.jsonData = mergedReview.jsonData
      const reviewUser = await models.User.query().findById(review.userId)

      await convertFilesToFullObjects(
        review,
        form,
        async ids => File.query().findByIds(ids),
        getFilesWithUrl,
      )

      return {
        id: review.id,
        created: review.created,
        updated: review.updated,
        isDecision: review.isDecision,
        open: review.open,
        user: reviewUser,
        isHiddenFromAuthor: review.isHiddenFromAuthor,
        isHiddenReviewerName: review.isHiddenReviewerName,
        canBePublishedPublicly: review.canBePublishedPublicly,
        jsonData: JSON.stringify(review.jsonData),
        manuscriptId: review.manuscriptId,
      }
    },

    async completeReview(_, { id }, ctx) {
      const review = await models.Review.query().findById(id)

      const manuscript = await models.Manuscript.query()
        .findById(review.manuscriptId)
        .withGraphFetched('[submitter.[defaultIdentity], channels.members]')

      const team = await manuscript
        .$relatedQuery('teams')
        .where('role', 'reviewer')
        .first()

      const member = await team
        .$relatedQuery('members')
        .where('userId', ctx.user)
        .first()

      member.status = 'completed'
      return member.save()
    },
  },
}

const typeDefs = `
  extend type Mutation {
    updateReview(id: ID, input: ReviewInput): Review!
    completeReview(id: ID!): TeamMember
  }

  type Review implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    isDecision: Boolean
    open: Boolean
    user: User
    isHiddenFromAuthor: Boolean
    isHiddenReviewerName: Boolean
    canBePublishedPublicly: Boolean
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
`

module.exports = { resolvers, typeDefs }
