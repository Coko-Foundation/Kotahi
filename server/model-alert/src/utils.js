const config = require('config')
const sendEmailNotification = require('../../email-notifications')
const ChannelMember = require('../../model-channel/src/channel_member')
const Message = require('../../model-message/src/message')
const User = require('../../model-user/src/user')
const Alert = require('./alert')
const Channel = require('../../model-channel/src/channel')

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

  const message = await Message.query().findById(messageId)
  const channel = await Channel.query().findById(message.channelId)

  const user = await User.query().findById(userId)

  // send email notification
  const urlFrag = config.journal.metadata.toplevel_urlfragment
  const baseUrl = config['pubsweet-client'].baseUrl + urlFrag

  const data = {
    receiverName: user.username,
    manuscriptPageUrl: `${baseUrl}/versions/${channel.manuscriptId}`,
  }

  await sendEmailNotification(user.email, 'alertUnreadMessageTemplate', data)

  await Alert.query().updateAndFetchById(alert.id, {
    isSent: true,
  })
}

module.exports = {
  sendAlerts,
  sendAlertForMessage,
}
