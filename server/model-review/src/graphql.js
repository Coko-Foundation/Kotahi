// const { flatten } = require('lodash')
// const Review = require('./review')
const models = require('@pubsweet/models')
const { get } = require('lodash')

const resolvers = {
  Query: {
    async sharedReviews(_, { id }, ctx) {
      const query = await models.Team.query()
        .where({
          manuscriptId: id,
        })
        .withGraphFetched('members.[user.reviews]')

      const teams = await query
      const authorTeam = teams.filter(team => team.role === 'author')
      const authorUser = get(authorTeam, 'members[0].user', {})

      const members = teams
        .filter(team => team.role === 'reviewer')
        .map(team => {
          return team.members
        })
        .flat()
        .filter(member => {
          return member.user.id === ctx.user || member.isShared
        })

      const reviews = members
        .map(teamMember => {
          return teamMember.user.reviews.map(review => {
            return { ...review, user: teamMember.user }
          })
        })
        .flat()
        .filter(review => {
          return review.manuscriptId === id
        })
        .filter(review => {
          return !(review.isHiddenFromAuthor && ctx.user === authorUser.id)
        })
        .map(review => {
          return review.isHiddenReviewerName && ctx.user === authorUser.id
            ? { ...review, user: { ...review.user, username: '' } }
            : review
        })

      return reviews
    },
  },
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      // We process comment fields into array
      const reviewUser = input.userId
        ? await models.User.query().where({
            id: input.userId,
          })
        : ctx.user

      const processedReview = { ...input, user: reviewUser }

      processedReview.comments = [
        input.reviewComment,
        input.confidentialComment,
        input.decisionComment,
      ].filter(Boolean)

      delete processedReview.reviewComment
      delete processedReview.confidentialComment
      delete processedReview.decisionComment

      const review = await models.Review.query().upsertGraphAndFetch(
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
      const review = await models.Review.query().findById(id)

      const manuscript = await models.Manuscript.query().findById(
        review.manuscriptId,
      )

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
  ReviewComment: {
    async files(parent, _, ctx) {
      return parent.files
        ? parent.files
        : models.File.query().where({ reviewCommentId: parent.id })
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
    isHiddenFromAuthor: Boolean
    isHiddenReviewerName: Boolean
    canBePublishedPublicly: Boolean
    userId: String
  }

  input ReviewInput {
    reviewComment: ReviewCommentInput
    confidentialComment: ReviewCommentInput
    decisionComment: ReviewCommentInput
    recommendation: String
    isDecision: Boolean
    manuscriptId: ID!
    isHiddenFromAuthor: Boolean
    isHiddenReviewerName: Boolean
    canBePublishedPublicly: Boolean
    userId: String
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
