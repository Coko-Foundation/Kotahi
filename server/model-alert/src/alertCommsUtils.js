const config = require('config')
const models = require('@pubsweet/models')
const sendEmailNotification = require('../../email-notifications')

const sendAlerts = async () => {
  const channelMembers = await models.ChannelMember.query()
    .whereNull('lastAlertTriggeredTime')
    .where(
      'lastViewed',
      '<',
      new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    )

  channelMembers.forEach(async channelMember => {
    // check if there are messages in the channel that have a larger timestamp than channelMemberlastviewed

    const earliestUnreadMessage = await models.Message.query()
      .where('created', '>', channelMember.lastViewed)
      .orderBy('created')
      .first()

    if (!earliestUnreadMessage) {
      return
    }

    await sendAlertForMessage({
      userId: channelMember.userId,
      messageId: earliestUnreadMessage.id,
      title: 'Unread messages in channel',
    })

    await models.ChannelMember.query().updateAndFetchById(channelMember.id, {
      lastAlertTriggeredTime: new Date(),
    })
  })
}

const sendAlertForMessage = async ({
  userId,
  messageId,
  title,
  triggerTime = new Date(),
}) => {
  const message = await models.Message.query().findById(messageId)
  const channel = await models.Channel.query().findById(message.channelId)

  const user = await models.User.query().findById(userId)

  // send email notification
  const urlFrag = config.journal.metadata.toplevel_urlfragment
  const baseUrl = config['pubsweet-client'].baseUrl + urlFrag

  const data = {
    receiverName: user.username,
    manuscriptPageUrl: `${baseUrl}/versions/${channel.manuscriptId}`,
  }

  await sendEmailNotification(user.email, 'alertUnreadMessageTemplate', data)

  await new models.Alert({
    title,
    userId,
    messageId,
    triggerTime,
    isSent: true,
  }).save()
}

module.exports = {
  sendAlerts,
  sendAlertForMessage,
}
