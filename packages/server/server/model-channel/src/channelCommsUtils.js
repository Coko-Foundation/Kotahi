const ChannelMember = require('../../../models/channelMember/channelMember.model')
const Channel = require('../../../models/channel/channel.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')

const getChannelMemberByChannel = async ({ channelId, userId }) => {
  return ChannelMember.query().findOne({ channelId, userId })
}

const updateChannelLastViewed = async ({ channelId, userId }) => {
  await ChannelMember.query()
    .patch({ lastViewed: new Date(), lastAlertTriggeredTime: null })
    .where({ channelId, userId })

  return ChannelMember.query().findOne({ channelId, userId })
}

const addUsersToChatChannel = async (channelId, userIds) => {
  const uniqueUserIds = [...new Set(userIds)]

  const records = uniqueUserIds.map(userId => ({
    channelId,
    userId,
    lastViewed: new Date(),
  }))

  await ChannelMember.query()
    .insert(records)
    .onConflict(['channelId', 'userId'])
    .ignore()
}

const addUserToManuscriptChatChannel = async ({
  manuscriptId,
  userId,
  type = 'all',
}) => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .select('parentId')

  const channel = await Channel.query()
    .where({
      manuscriptId: manuscript.parentId || manuscriptId,
      type,
    })
    .first()

  const channelMember = await ChannelMember.query()
    .where({
      channelId: channel.id,
      userId,
    })
    .first()

  if (!channelMember) {
    await new ChannelMember({
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
  await ChannelMember.query().delete().where({ userId }).whereExists(
    ChannelMember.relatedQuery('channel').where({
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
