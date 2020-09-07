// const merge = require('lodash/merge')
// const Review = require('./review')

const resolvers = {
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      // We process comment fields into array
      input.user = ctx.user
      const processedReview = Object.assign({}, input)
      processedReview.comments = [
        input.reviewComment,
        input.confidentialComment,
        input.decisionComment,
      ].filter(Boolean)

      delete processedReview.reviewComment
      delete processedReview.confidentialComment
      delete processedReview.decisionComment

      const review = await ctx.models.Review.query().upsertGraphAndFetch(
        {
          id,
          ...processedReview,
        },
        {
          relate: true,
          noUnrelate: true,
          noDelete: true,
        },
      )

      return review
    },

    async completeReview(_, { id }, ctx) {
      const review = await ctx.models.Review.query().findById(id)
      const manuscript = await ctx.models.Manuscript.query().findById(
        review.manuscriptId,
      )
      const team = await manuscript
        .$relatedQuery('teams')
        .where('role', 'reviewer')
        .first()

      const member = await team
        .$relatedQuery('members')
        .where('userId', ctx.user.id)
        .first()

      member.status = 'completed'
      return member.save()
    },
  },
  ReviewComment: {
    async files(parent, _, ctx) {
      return parent.files
        ? parent.files
        : ctx.models.File.query().where({ reviewCommentId: parent.id })
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
    recommendation: String
    isDecision: Boolean
    open: Boolean
    user: User
    reviewComment: ReviewComment
    confidentialComment: ReviewComment
    decisionComment: ReviewComment
  }

  input ReviewInput {
    reviewComment: ReviewCommentInput
    confidentialComment: ReviewCommentInput
    decisionComment: ReviewCommentInput
    recommendation: String
    isDecision: Boolean
    manuscriptId: ID!
  }

  type ReviewComment implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    commentType: String
    content: String
    files: [File]
  }

  input ReviewCommentInput {
    id: ID
    commentType: String
    content: String
  }
`

module.exports = { resolvers, typeDefs }
