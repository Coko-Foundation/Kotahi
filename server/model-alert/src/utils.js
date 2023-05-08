const sendEmailNotification = require('../../email-notifications')
const ChannelMember = require('../../model-channel/src/channel_member')
const Message = require('../../model-message/src/message')
const Alert = require('./alert')

const sendAlerts = async () => {
  const channelMembers = await ChannelMember.query()
    .whereNull('lastAlertTriggeredTime')
    .where(
      'lastViewed',
      '<',
      new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    )

  channelMembers.forEach(async channelMember => {
    // check if there are messages in the channel that have a larger timestamp than channelMemberlastviewed

    const channelUnreadMessage = await Message.query()
      .where('created', '>', channelMember.lastViewed)
      .first()

    if (!channelUnreadMessage) {
      return
    }

    await sendAlertForMessage({
      userId: channelMember.userId,
      messageId: channelUnreadMessage.id,
      title: 'Unread messages in channel',
    })

    await ChannelMember.query().updateAndFetchById(channelMember.id, {
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
  const alert = await new Alert({
    title,
    userId,
    messageId,
    triggerTime,
  }).save()

  // send email notification
  const data = {
    receiverName: 'User Name',
    manuscriptPageUrl: 'https://google.com',
  }

  await sendEmailNotification(
    'vaibhav@coloredcow.com',
    'alertUnreadMessageTemplate',
    data,
  )

  await Alert.query().updateAndFetchById(alert.id, {
    isSent: true,
  })
}

module.exports = {
  sendAlerts,
  sendAlertForMessage,
}
