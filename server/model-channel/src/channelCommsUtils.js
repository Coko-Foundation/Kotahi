const models = require('@pubsweet/models')

const getChannelMemberByChannel = async ({ channelId, userId }) => {
  return models.ChannelMember.query().findOne({ channelId, userId })
}

const updateChannelLastViewed = async ({ channelId, userId }) => {
  await models.ChannelMember.query()
    .patch({ lastViewed: new Date(), lastAlertTriggeredTime: null })
    .where({ channelId, userId })

  return models.ChannelMember.query().findOne({ channelId, userId })
}

const addUsersToChatChannel = async (channelId, userIds) => {
  const uniqueUserIds = [...new Set(userIds)]

  const records = uniqueUserIds.map(userId => ({
    channelId,
    userId,
    lastViewed: new Date(),
  }))

  await models.ChannelMember.query()
    .insert(records)
    .onConflict(['channelId', 'userId'])
    .ignore()
}

const addUserToManuscriptChatChannel = async ({
  manuscriptId,
  userId,
  type = 'all',
}) => {
  const manuscript = await models.Manuscript.query().findById(manuscriptId)

  const channel = await models.Channel.query()
    .where({
      manuscriptId: manuscript.parentId || manuscriptId,
      type,
    })
    .first()

  const channelMember = await models.ChannelMember.query()
    .where({
      channelId: channel.id,
      userId,
    })
    .first()

  if (!channelMember) {
    await new models.ChannelMember({
      channelId: channel.id,
      userId,
      lastViewed: new Date(),
    }).save()
  }
}

const removeUserFromManuscriptChatChannel = async ({
  manuscriptId,
  userId = null,
  type = 'all',
}) => {
  await models.ChannelMember.query().delete().where({ userId }).whereExists(
    models.ChannelMember.relatedQuery('channel').where({
      manuscriptId,
      type,
    }),
  )
}

module.exports = {
  getChannelMemberByChannel,
  updateChannelLastViewed,
  addUserToManuscriptChatChannel,
  addUsersToChatChannel,
  removeUserFromManuscriptChatChannel,
}
