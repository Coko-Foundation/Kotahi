const ThreadedDiscussion = require('../../../models/threadedDiscussion/threadedDiscussion.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')

const {
  getIdOfLatestVersionOfManuscript,
} = require('../../model-manuscript/src/manuscriptCommsUtils')

const {
  getUsersById,
  getUserRolesInManuscript,
} = require('../../model-user/src/userCommsUtils')

const {
  convertUsersPendingVersionsToCommentVersions,
  addUserObjectsToDiscussion,
  stripPendingVersionsExceptByUser,
} = require('./threadedDiscussionUtils')

const getOriginalVersionManuscriptId = async manuscriptId => {
  const ms = await Manuscript.query().select('parentId').findById(manuscriptId)

  const parentId = ms ? ms.parentId : null
  return parentId || manuscriptId
}

/** Returns a threadedDiscussion that strips out all pendingVersions not for this userId,
 * then all comments that don't have any remaining pendingVersion or commentVersions,
 * then all threads that don't have any remaining comments.
 * Also adds flags indicating what the user is permitted to do.
 */
const stripHiddenAndAddUserInfo = async (
  discussion,
  userId,
  getUsersByIdFunc,
) => {
  const discussionWithUsers = await addUserObjectsToDiscussion(
    discussion,
    getUsersByIdFunc,
  )

  const userRoles = await getUserRolesInManuscript(
    userId,
    await getIdOfLatestVersionOfManuscript(discussion.manuscriptId),
  )

  return {
    ...stripPendingVersionsExceptByUser(discussionWithUsers, userId),
    userCanAddComment:
      userRoles.author || userRoles.anyEditor || userRoles.groupManager, // Current use case prohibits reviewers from commenting
    userCanEditOwnComment: userRoles.anyEditor || userRoles.groupManager,
    userCanEditAnyComment: userRoles.anyEditor || userRoles.groupManager,
  }
}

const resolvers = {
  Query: {
    async threadedDiscussions(_, { manuscriptId: msVersionId }, ctx) {
      const manuscriptId = await getOriginalVersionManuscriptId(msVersionId)

      const result = await ThreadedDiscussion.query()
        .where({ manuscriptId })
        .orderBy('created', 'desc')

      return Promise.all(
        result.map(async discussion => {
          return stripHiddenAndAddUserInfo(discussion, ctx.user, getUsersById)
        }),
      )
    },
  },

  Mutation: {
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
      // TODO ensure that the current user is permitted to comment
      const now = new Date().toISOString()
      const manuscriptId = await getOriginalVersionManuscriptId(msVersionId)

      let discussion = await ThreadedDiscussion.query().findById(
        threadedDiscussionId,
      )
      if (!discussion)
        discussion = {
          id: threadedDiscussionId,
          manuscriptId,
          threads: [],
          created: now,
        }

      let thread = discussion.threads.find(t => t.id === threadId)

      if (!thread) {
        thread = { id: threadId, comments: [], created: now }
        discussion.threads.push(thread)
      }

      let commnt = thread.comments.find(c => c.id === commentId)

      if (!commnt) {
        commnt = {
          id: commentId,
          manuscriptVersionId: msCurrentVersionId,
          commentVersions: [],
          pendingVersions: [],
          created: now,
        }
        thread.comments.push(commnt)
      }

      let pendingVersion = commnt.pendingVersions.find(
        pv => pv.userId === ctx.user,
      )

      if (!pendingVersion) {
        pendingVersion = {
          userId: ctx.user,
          created: now,
        }
        commnt.pendingVersions.push(pendingVersion)
      }

      pendingVersion.updated = now
      pendingVersion.comment = comment

      await ThreadedDiscussion.query().upsertGraphAndFetch(
        { ...discussion, threads: JSON.stringify(discussion.threads) },
        { insertMissing: true },
      )

      return stripHiddenAndAddUserInfo(discussion, ctx.user, getUsersById)
    },
    /* eslint-disable no-restricted-syntax */
    async completeComments(_, { threadedDiscussionId }, ctx) {
      const now = new Date().toISOString()
      let hasUpdated = false

      const discussion = await ThreadedDiscussion.query().findById(
        threadedDiscussionId,
      )

      if (!discussion)
        throw new Error(
          `threadedDiscussion with ID ${threadedDiscussionId} not found`,
        )

      for (const thread of discussion.threads) {
        for (const comment of thread.comments) {
          if (
            convertUsersPendingVersionsToCommentVersions(ctx.user, comment, now)
          ) {
            hasUpdated = true
            thread.updated = now
            discussion.updated = now
          }
        }
      }

      if (hasUpdated)
        await ThreadedDiscussion.query()
          .update({
            updated: discussion.updated,
            threads: JSON.stringify(discussion.threads),
          })
          .where({ id: threadedDiscussionId })

      return stripHiddenAndAddUserInfo(discussion, ctx.user, getUsersById)
    },
    /* eslint-enable no-restricted-syntax */
    async completeComment(
      _,
      { threadedDiscussionId, threadId, commentId },
      ctx,
    ) {
      const now = new Date().toISOString()

      const discussion = await ThreadedDiscussion.query().findById(
        threadedDiscussionId,
      )

      if (!discussion)
        throw new Error(
          `threadedDiscussion with ID ${threadedDiscussionId} not found`,
        )

      const thread = discussion.threads.find(t => t.id === threadId)
      if (!thread) throw new Error(`thread with ID ${threadId} not found`)
      const comment = thread.comments.find(c => c.id === commentId)
      if (!comment) throw new Error(`comment with ID ${commentId} not found`)

      if (
        convertUsersPendingVersionsToCommentVersions(ctx.user, comment, now)
      ) {
        thread.updated = now
        discussion.updated = now

        await ThreadedDiscussion.query()
          .update({
            updated: discussion.updated,
            threads: JSON.stringify(discussion.threads),
          })
          .where({ id: threadedDiscussionId })
      }

      return stripHiddenAndAddUserInfo(discussion, ctx.user, getUsersById)
    },
    async deletePendingComment(
      _,
      { threadedDiscussionId, threadId, commentId },
      ctx,
    ) {
      const discussion = await ThreadedDiscussion.query().findById(
        threadedDiscussionId,
      )

      if (!discussion)
        throw new Error(
          `threadedDiscussion with ID ${threadedDiscussionId} not found`,
        )

      const thread = discussion.threads.find(t => t.id === threadId)
      if (!thread) throw new Error(`thread with ID ${threadId} not found`)
      const comment = thread.comments.find(c => c.id === commentId)
      if (!comment) throw new Error(`comment with ID ${commentId} not found`)

      comment.pendingVersions = comment.pendingVersions.filter(
        pv => pv.userId !== ctx.user,
      )

      await ThreadedDiscussion.query()
        .update({
          updated: discussion.updated,
          threads: JSON.stringify(discussion.threads),
        })
        .where({ id: threadedDiscussionId })

      return stripHiddenAndAddUserInfo(discussion, ctx.user, getUsersById)
    },
  },
}

const typeDefs = `
extend type Query {
  threadedDiscussions(manuscriptId: ID!): [ThreadedDiscussion!]!
}
extend type Mutation {
  updatePendingComment(manuscriptId: ID!, threadedDiscussionId: ID!, threadId: ID!, commentId: ID!, comment: String, manuscriptVersionId: ID): ThreadedDiscussion!
  completeComments(threadedDiscussionId: ID!): ThreadedDiscussion!
  completeComment(threadedDiscussionId: ID!, threadId: ID!, commentId: ID!): ThreadedDiscussion!
  deletePendingComment(threadedDiscussionId: ID!, threadId: ID!, commentId: ID!): ThreadedDiscussion!
}

type ThreadedDiscussion {
  id: ID!
  created: DateTime!
  updated: DateTime
  manuscriptId: ID!
  threads: [DiscussionThread!]!
  userCanAddComment: Boolean!
  userCanEditOwnComment: Boolean!
  userCanEditAnyComment: Boolean!
}

type DiscussionThread {
  id: ID
  created: DateTime
  updated: DateTime
  comments: [ThreadComment]
}

type ThreadComment {
  id: ID!
  created: DateTime!
  updated: DateTime
  manuscriptVersionId: ID
  commentVersions: [ThreadedCommentVersion!]!
  pendingVersion: PendingThreadComment
}

type ThreadedCommentVersion {
  id: ID!
  created: DateTime!
  updated: DateTime
  author: User!
  comment: String!
}

type PendingThreadComment {
  created: DateTime!
  updated: DateTime
  author: User!
  comment: String!
}
`

module.exports = { typeDefs, resolvers }
