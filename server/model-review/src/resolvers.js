const merge = require('lodash/merge')
const Review = require('./review')

const resolvers = {
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      if (id) {
        const review = await ctx.models.Review.query().findById(id)
        const update = merge({}, review, input)
        // Load Review
        const rvw = await ctx.models.Review.query().updateAndFetchById(
          id,
          update,
        )
        rvw.comments = await rvw.getComments()

        return rvw
      }
      input.userId = ctx.user.id
      const review = await new Review(input)
      await review.save()
      review.comments = await review.getComments()

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
}

module.exports = resolvers
