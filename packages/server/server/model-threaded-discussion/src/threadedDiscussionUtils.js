const { v4: uuid } = require('uuid')

const filterDistinct = (id, index, arr) => arr.indexOf(id) === index

/** Get all authors of commentVersions and pendingVersions throughout the discussion */
const getAllUserIdsInDiscussion = discussion =>
  discussion.threads
    .map(t =>
      t.comments.map(c =>
        c.commentVersions
          .map(v => v.userId)
          .concat(c.pendingVersions.map(v => v.userId)),
      ),
    )
    .flat(2)
    .filter(filterDistinct)

/** Get the threaded discussion with "author" user object added to each commentVersion and pendingVersion */
const addUserObjectsToDiscussion = async (discussion, getUsersByIdFunc) => {
  const userIds = getAllUserIdsInDiscussion(discussion)
  const users = await getUsersByIdFunc(userIds)
  const usersMap = {}
  users.forEach(u => (usersMap[u.id] = u))

  return {
    ...discussion,
    threads: discussion.threads.map(thread => ({
      ...thread,
      comments: thread.comments.map(c => ({
        ...c,
        commentVersions: c.commentVersions.map(cv => ({
          ...cv,
          author: usersMap[cv.userId],
        })),
        pendingVersions: c.pendingVersions.map(pv => ({
          ...pv,
          author: usersMap[pv.userId],
        })),
      })),
    })),
  }
}

const isNewEmptyComment = (pendingVersion, commentVersions) =>
  (!pendingVersion || pendingVersion.comment === '<p class="paragraph"></p>') &&
  (!commentVersions || !commentVersions.length)

/** Complete all pending comments for this user. That is, turn them into commentVersions.
 * Note: this modifies the discussion IN PLACE. */
/* eslint-disable no-restricted-syntax, no-param-reassign */
const convertUsersPendingVersionsToCommentVersions = (userId, comment, now) => {
  let hasUpdated = false

  // Should be only one pendingVersion for a user, but to be safe we assume there could be multiple
  for (const pendingVersion of comment.pendingVersions.filter(
    pv =>
      pv.userId === userId && !isNewEmptyComment(pv, comment.commentVersions),
  )) {
    if (!comment.commentVersions) comment.commentVersions = []

    comment.commentVersions.push({
      id: uuid(),
      created: now,
      updated: now,
      userId,
      comment: pendingVersion.comment,
    })
    hasUpdated = true
    comment.updated = now
  }

  comment.pendingVersions = comment.pendingVersions.filter(
    pv => pv.userId !== userId,
  )

  return hasUpdated
}
/* eslint-enable no-restricted-syntax, no-param-reassign */

/** Return a copy of the discussion with all pendingVersions of comments by other users stripped out.
 * There should be no more than 1 pendingVersion for the given user in each comment,
 * so instead of supplying a pendingVersions array we provide a single pendingVersion value which can be undefined.
 */
const stripPendingVersionsExceptByUser = (discussion, userId) => ({
  ...discussion,
  threads: discussion.threads
    .map(thread => ({
      ...thread,
      comments: thread.comments
        .map(c => ({
          ...c,
          pendingVersion: c.pendingVersions.filter(
            pv => pv.userId === userId,
          )[0], // Should be no more than 1 pendingVersion for any user
          pendingVersions: undefined, // Hide pendingVersions for other users
        }))
        .filter(c => c.commentVersions.length || c.pendingVersion),
    }))
    .filter(t => t.comments.length),
})

module.exports = {
  convertUsersPendingVersionsToCommentVersions,
  getAllUserIdsInDiscussion,
  addUserObjectsToDiscussion,
  stripPendingVersionsExceptByUser,
}
