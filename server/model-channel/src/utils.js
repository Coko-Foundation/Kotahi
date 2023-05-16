const Channel = require('./channel')
const ChannelMember = require('./channel_member')

const updateChannelLastViewed = async ({ channelId, userId }) => {
  const channelMember = await ChannelMember.query().findOne({
    channelId,
    userId,
  })

  if (channelMember) {
    await ChannelMember.query().updateAndFetchById(channelMember.id, {
      lastViewed: new Date(),
    })
  }
}

const addUserToManuscriptChatChannel = async ({
  manuscriptId,
  userId,
  type = 'all',
}) => {
  const channel = await Channel.query()
    .where({
      manuscriptId,
      type,
    })
    .first()

  await new ChannelMember({
    channelId: channel.id,
    userId,
    lastViewed: new Date(),
  }).save()
}

const removeUserFromManuscriptChatChannel = async ({
  manuscriptId,
  userId = null,
  type = 'all',
}) => {
  const channel = await Channel.query()
    .where({
      manuscriptId,
      type,
    })
    .first()

  await ChannelMember.query()
    .where({
      channelId: channel.id,
      userId,
    })
    .delete()
}

module.exports = {
  updateChannelLastViewed,
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
}
