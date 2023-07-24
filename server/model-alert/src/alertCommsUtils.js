const config = require('config')
const models = require('@pubsweet/models')
const sendEmailNotification = require('../../email-notifications')

const {
  getUserRolesInManuscript,
} = require('../../model-user/src/userCommsUtils')

const sendAlerts = async () => {
  const channelMembers = await models.ChannelMember.query()
    .whereNull('lastAlertTriggeredTime')
    .where(
      'lastViewed',
      '<',
      new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    )
    .withGraphJoined('user')

  channelMembers.forEach(async channelMember => {
    // Check if notification preference is true for the user
    if (!channelMember.user.eventNotificationsOptIn) {
      return
    }

    // check if there are messages in the channel that have a larger timestamp than channelMemberlastviewed
    const earliestUnreadMessage = await models.Message.query()
      .where({ channelId: channelMember.channelId })
      .where('created', '>', channelMember.lastViewed)
      .orderBy('created')
      .first()

    if (!earliestUnreadMessage) {
      return
    }

    await sendAlertForMessage({
      user: channelMember.user,
      messageId: earliestUnreadMessage.id,
      title: 'Unread messages in channel',
    })

    await models.ChannelMember.query().updateAndFetchById(channelMember.id, {
      lastAlertTriggeredTime: new Date(),
    })
  })
}

const sendAlertForMessage = async ({
  user,
  messageId,
  title,
  triggerTime = new Date(),
}) => {
  const message = await models.Message.query().findById(messageId)
  const channel = await models.Channel.query().findById(message.channelId)

  // send email notification
  const urlFrag = config.journal.metadata.toplevel_urlfragment
  const baseUrl = config['pubsweet-client'].baseUrl + urlFrag

  let discussionUrl = baseUrl

  if (!channel.manuscriptId) {
    discussionUrl += `/admin/manuscripts` // admin discussion
  } else {
    discussionUrl += `/versions/${channel.manuscriptId}`
    const roles = await getUserRolesInManuscript(user.id, channel.manuscriptId)

    if (roles.groupManager || roles.anyEditor) {
      discussionUrl += '/decision'

      if (channel.type === 'editorial') {
        discussionUrl += '?discussion=editorial'
      }
    } else if (roles.reviewer) {
      discussionUrl += '/review'
    } else if (roles.author) {
      discussionUrl += '/submit'
    } else {
      discussionUrl = `${baseUrl}/dashboard`
    }
  }

  const data = {
    receiverName: user.username,
    discussionUrl,
  }

  const activeConfig = await models.Config.query().first() // To be replaced with group based active config in future

  const selectedTemplate =
    activeConfig.formData.eventNotification.alertUnreadMessageDigestTemplate

  const selectedEmailTemplate = await models.EmailTemplate.query().findById(
    selectedTemplate,
  )

  await sendEmailNotification(user.email, selectedEmailTemplate, data)

  await new models.Alert({
    title,
    userId: user.id,
    messageId,
    triggerTime,
    isSent: true,
  }).save()
}

module.exports = {
  sendAlerts,
  sendAlertForMessage,
}
