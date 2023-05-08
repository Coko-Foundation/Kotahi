const ChannelMember = require('./channel_member')

const updateChannelLastViewed = async ({ channelId, userId }) => {
  const channelMember = await ChannelMember.query().findOne({
    channelId,
    userId,
  })

  if (!channelMember) {
    await new ChannelMember({
      channelId,
      userId,
      lastViewed: new Date(),
    }).save()
  } else {
    await ChannelMember.query().updateAndFetchById(channelMember.id, {
      lastViewed: new Date(),
    })
  }
}

module.exports = {
  updateChannelLastViewed,
}
