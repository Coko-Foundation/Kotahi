const {
  completeComment,
  completeComments,
  deletePendingComment,
  threadedDiscussions,
  updatePendingComment,
} = require('../../../controllers/threadedDiscussion.controllers')

module.exports = {
  Query: {
    async threadedDiscussions(_, { manuscriptId: msVersionId }, ctx) {
      return threadedDiscussions(msVersionId, ctx.userId)
    },
  },

  Mutation: {
    async completeComment(
      _,
      { threadedDiscussionId, threadId, commentId },
      ctx,
    ) {
      const groupId = ctx.req.headers['group-id']
      return completeComment(
        threadedDiscussionId,
        threadId,
        commentId,
        groupId,
        ctx.userId,
      )
    },

    async completeComments(_, { threadedDiscussionId }, ctx) {
      return completeComments(threadedDiscussionId, ctx.userId)
    },

    async deletePendingComment(
      _,
      { threadedDiscussionId, threadId, commentId },
      ctx,
    ) {
      return deletePendingComment(
        threadedDiscussionId,
        threadId,
        commentId,
        ctx.userId,
      )
    },

    async updatePendingComment(
      _,
      {
        manuscriptId: msVersionId,
        threadedDiscussionId,
        threadId,
        commentId,
        comment,
        manuscriptVersionId: msCurrentVersionId,
      },
      ctx,
    ) {
      return updatePendingComment(
        msVersionId,
        threadedDiscussionId,
        threadId,
        commentId,
        comment,
        msCurrentVersionId,
        ctx.userId,
      )
    },
  },
}
