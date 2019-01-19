const merge = require('lodash/merge')
const Review = require('./review')

const resolvers = {
  Mutation: {
    async updateReview(_, { id, input }, ctx) {
      if (id) {
        const review = await Review.find(id)
        const update = merge({}, review, input)
        const updateReview = await new Review(update).save()
        updateReview.comments = await updateReview.getComments()
        return updateReview
      }
      input.userId = ctx.user
      const review = await new Review(input).save()
      review.comments = await review.getComments()
      return review
    },
  },
}

module.exports = resolvers
