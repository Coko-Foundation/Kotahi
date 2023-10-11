const config = require('config')
const models = require('@pubsweet/models')
const sendEmailNotification = require('../../email-notifications')

const {
  getUserRolesInManuscript,
} = require('../../model-user/src/userCommsUtils')

const sendNotifications = async () => {
  // The following query results first row for every user and path string combination
  // in the notification digest, where max notification time is in the past.
  const notificationDigestRows = await models.NotificationDigest.query()
    .distinctOn(['user_id', 'path_string'])
    .where('max_notification_time', '<', new Date())
    .orderBy(['user_id', 'path_string', 'max_notification_time'])

  await Promise.all(
    notificationDigestRows.map(async notificationDigest => {
      if (notificationDigest.actioned) return

      await sendChatNotification({
        recipientId: notificationDigest.userId,
        messageId: notificationDigest.context.messageId,
        title: 'Unread messages in chat',
      })

      // query to update all notificationdigest entries where user=user and path=path
      await models.NotificationDigest.query()
        .update({
          actioned: true,
        })
        .where({
          userId: notificationDigest.userId,
          pathString: notificationDigest.pathString,
        })
    }),
  )
}

const sendChatNotification = async ({
  recipientId,
  messageId,
  currentUserId = null,
  isMentioned = false,
}) => {
  const recipient = await models.User.query().findById(recipientId)
  const message = await models.Message.query().findById(messageId)
  const channel = await models.Channel.query().findById(message.channelId)
  const { groupId } = channel
  const group = await models.Group.query().findById(groupId)

  // send email notification
  const baseUrl = `${config['pubsweet-client'].baseUrl}/${group.name}`

  let discussionUrl = baseUrl

  if (!channel.manuscriptId) {
    discussionUrl += `/admin/manuscripts` // admin discussion
  } else {
    discussionUrl += `/versions/${channel.manuscriptId}`

    const roles = await getUserRolesInManuscript(
      recipient.id,
      channel.manuscriptId,
    )

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

  let currentUser

  if (currentUserId) {
    currentUser = await models.User.query().findById(currentUserId)
  }

  const data = {
    recipientName: recipient.username,
    discussionUrl,
    currentUser: currentUser?.username,
  }

  const activeConfig = await models.Config.getCached(groupId)

  const selectedTemplate = isMentioned
    ? activeConfig.formData.eventNotification.mentionNotificationTemplate
    : activeConfig.formData.eventNotification.alertUnreadMessageDigestTemplate

  if (!selectedTemplate) return

  const selectedEmailTemplate = await models.EmailTemplate.query().findById(
    selectedTemplate,
  )

  await sendEmailNotification(
    recipient.email,
    selectedEmailTemplate,
    data,
    groupId,
  )
}

const getNotificationOptionForUser = async ({ userId, path, groupId }) => {
  if (!userId)
    throw new Error('Cannot get notification option for unregistered user')
  const lastPathSegment = path.length ? path[path.length - 1] : null

  // Get all records for this user in this group, that might relate to the current path,
  // skipping those set to 'inherit'.
  // A small number of non-relevant records may be included.
  const records = await models.NotificationUserOption.query()
    .where({ userId, groupId })
    .where(builder =>
      builder.where({ objectId: lastPathSegment }).orWhere({ objectId: null }),
    )
    .whereNot({ option: 'inherit' })

  // We're only interested in records whose paths are subpaths of the specified path
  const relevantRecords = records.filter(record => {
    if (record.path.length > path.length) return false

    for (let i = 0; i < record.path.length; i += 1) {
      if (record.path[i] !== path[i]) return false
    }

    return true
  })

  relevantRecords.sort((a, b) => b.path.length - a.path.length)
  const nearestAncestor = relevantRecords[0]

  return nearestAncestor?.option || '30MinSummary' // Fallback if no options are set
}

const notify = async (
  path,
  { context, time, users, groupId, currentUserId },
) => {
  if (!users) return

  // eslint-disable-next-line consistent-return
  const notificationPromises = users.map(async userId => {
    if (context.isMentioned) {
      // Immediate notification recipients
      return sendChatNotification({
        recipientId: userId,
        messageId: context.messageId,
        isMentioned: context.isMentioned,
        currentUserId,
      })
    }

    const option = await getNotificationOptionForUser({
      userId,
      path,
      groupId,
    })

    if (option === '30MinSummary') {
      const maxNotificationTime = new Date(time)
      maxNotificationTime.setMinutes(maxNotificationTime.getMinutes() + 30)

      return new models.NotificationDigest({
        time,
        maxNotificationTime,
        pathString: path.join('/'),
        option,
        context,
        userId,
        groupId,
      }).save()
    }
  })

  await Promise.all(notificationPromises)
}

module.exports = {
  sendNotifications,
  sendChatNotification,
  getNotificationOptionForUser,
  notify,
}
