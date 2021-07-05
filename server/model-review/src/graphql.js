const { flatten } = require('lodash')
// const Review = require('./review')

const resolvers = {
  Query: {
    async sharedReviews(_, { id }, ctx) {
      const query = await ctx.models.Team.query()
        .where({
          manuscriptId: id,
        })
        .withGraphFetched('members.[user.reviews]')

      const teams = await query

      const members = flatten(
        teams
          .filter(team => team.role === 'reviewer')
          .map(team => {
            return team.members
          }),
      ).filter(member => {
        return member.user.id === ctx.user.id || member.isShared
      })

      const reviews = members.map(teamMember => {
        return teamMember.user.reviews
      })

      return flatten(reviews)
    },
  },
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      // We process comment fields into array
      const processedReview = { ...input, user: ctx.user }
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
  Review: {
    async user(parent, _, ctx) {
      return parent.user
        ? parent.user
        : ctx.models.User.query().findById(parent.userId)
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

  extend type Query {
    sharedReviews(id: ID): [Review]
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
