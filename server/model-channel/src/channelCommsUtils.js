const models = require('@pubsweet/models')

const updateChannelLastViewed = async ({ channelId, userId }) => {
  await models.ChannelMember.query()
    .update({ lastViewed: new Date() })
    .where({ channelId, userId })
}

const addUserToManuscriptChatChannel = async ({
  manuscriptId,
  userId,
  type = 'all',
}) => {
  const channel = await models.Channel.query()
    .where({
      manuscriptId,
      type,
    })
    .first()

  await new models.ChannelMember({
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
  await models.ChannelMember.query().delete().where({ userId }).whereExists(
    models.ChannelMember.relatedQuery('channel').where({
      manuscriptId,
      type,
    }),
  )
}

const resetLastAlertTriggerTime = async () => {
  await models.ChannelMember.query()
    .update({ lastAlertTriggeredTime: null })
    .whereRaw('last_alert_triggered_time < last_viewed')
}

module.exports = {
  updateChannelLastViewed,
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
  resetLastAlertTriggerTime,
}
