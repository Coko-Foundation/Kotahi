const models = require('@pubsweet/models')
const { addUserObjectsToDiscussion } = require('./threadedDiscussionUtils')

const getThreadedDiscussionsForManuscript = async (manuscript, getUsersById) =>
  Promise.all(
    (
      await models.ThreadedDiscussion.query().where({
        manuscriptId: manuscript.parentId || manuscript.id,
      })
    ).map(discussion => addUserObjectsToDiscussion(discussion, getUsersById)),
  )

module.exports = { getThreadedDiscussionsForManuscript }
