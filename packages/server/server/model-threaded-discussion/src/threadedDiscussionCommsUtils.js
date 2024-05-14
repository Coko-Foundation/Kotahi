const { addUserObjectsToDiscussion } = require('./threadedDiscussionUtils')

const ThreadedDiscussion = require('../../../models/threadedDiscussion/threadedDiscussion.model')

const getThreadedDiscussionsForManuscript = async (manuscript, getUsersById) =>
  Promise.all(
    (
      await ThreadedDiscussion.query().where({
        manuscriptId: manuscript.parentId || manuscript.id,
      })
    ).map(discussion => addUserObjectsToDiscussion(discussion, getUsersById)),
  )

module.exports = { getThreadedDiscussionsForManuscript }
