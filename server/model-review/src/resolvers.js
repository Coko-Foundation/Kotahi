const merge = require('lodash/merge')
const Review = require('./review')

const resolvers = {
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      if (id) {
        const review = await ctx.connectors.Review.fetchOne(id, ctx)
        const update = merge({}, review, input)
        await ctx.connectors.Review.update(id, update, ctx)
        // Load Review
        const rvw = await new Review(update)
        rvw.comments = await rvw.getComments()

        return rvw
      }
      input.userId = ctx.user
      const review = await new Review(input)
      await review.save()
      review.comments = await review.getComments()

      return review
    },
  },
}

module.exports = resolvers
