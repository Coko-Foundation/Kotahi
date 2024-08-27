const { clientUrl } = require('@coko/server')

const sendEmailNotification = require('../../../services/emailNotifications')

const NotificationDigest = require('../../../models/notificationDigest/notificationDigest.model')
const NotificationUserOption = require('../../../models/notificationUserOption/notificationUserOption.model')
const User = require('../../../models/user/user.model')
const Message = require('../../../models/message/message.model')
const Channel = require('../../../models/channel/channel.model')
const Config = require('../../../models/config/config.model')
const EmailTemplate = require('../../../models/emailTemplate/emailTemplate.model')
const Group = require('../../../models/group/group.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')

const {
  getUserRolesInManuscript,
} = require('../../model-user/src/userCommsUtils')

const sendNotifications = async groupId => {
  // The following query results first row for every user and path string combination
  // in the notification digest, where max notification time is in the past.
  const notificationDigestRows = await NotificationDigest.query()
    .distinctOn(['user_id', 'path_string'])
    .where('max_notification_time', '<', new Date())
    .where({ groupId })
    .orderBy(['user_id', 'path_string', 'max_notification_time'])

  let notificationCount = 0

  await Promise.all(
    notificationDigestRows.map(async notificationDigest => {
      if (notificationDigest.actioned) return

      await sendChatNotification({
        recipientId: notificationDigest.userId,
        messageId: notificationDigest.context.messageId,
        groupId,
      })

      notificationCount += 1

      // query to update all notificationdigest entries where user=user and path=path
      await NotificationDigest.query()
        .update({
          actioned: true,
        })
        .where({
          userId: notificationDigest.userId,
          pathString: notificationDigest.pathString,
          groupId,
        })
    }),
  )

  if (notificationCount > 0) {
    // eslint-disable-next-line no-console
    console.info(
      `Sent ${notificationCount} event notification${
        notificationCount === 1 ? '' : 's'
      } for group ${groupId}`,
    )
  }
}

const sendChatNotification = async ({
  recipientId,
  messageId,
  groupId,
  currentUserId = null,
  isMentioned = false,
}) => {
  const recipient = await User.query().findById(recipientId)
  const message = await Message.query().findById(messageId)
  const channel = await Channel.query().findById(message.channelId)
  if (channel.groupId !== groupId)
    throw new Error(
      `Attempt by group ${groupId} to send chat notification for group ${channel.groupId}`,
    )
  const group = await Group.query().findById(groupId)

  // send email notification
  const appUrl = `${clientUrl}/${group.name}`
  let manuscriptPageUrl = ''
  let manuscriptProductionPageUrl = ''
  let authorName = ''

  let discussionUrl = appUrl

  let manuscript = null

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
      discussionUrl = `${appUrl}/dashboard`
    }

    manuscript = await Manuscript.query().findById(channel.manuscriptId)

    const author = await manuscript.getManuscriptAuthor()

    authorName = author ? author.username : ''
    manuscriptPageUrl = `${appUrl}/versions/${manuscript.id}`
    manuscriptProductionPageUrl = `${appUrl}/versions/${manuscript.id}/production`
  }

  let currentUser

  if (currentUserId) {
    currentUser = await User.query().findById(currentUserId)
  }

  const data = {
    recipientName: recipient.username,
    discussionUrl,
    senderName: currentUser?.username || '',
    ...(manuscript
      ? {
          authorName,
          manuscriptNumber: manuscript.shortId,
          manuscriptLink: manuscriptPageUrl,
          manuscriptTitle: manuscript.submission.$title,
          manuscriptTitleLink: manuscript.submission.$sourceUri,
          manuscriptProductionLink: manuscriptProductionPageUrl,
        }
      : {}),
  }

  const activeConfig = await Config.getCached(groupId)

  const selectedTemplate = isMentioned
    ? activeConfig.formData.eventNotification.mentionNotificationTemplate
    : activeConfig.formData.eventNotification.alertUnreadMessageDigestTemplate

  if (!selectedTemplate) return

  const selectedEmailTemplate = await EmailTemplate.query().findById(
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
  const records = await NotificationUserOption.query()
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
    const option = await getNotificationOptionForUser({
      userId,
      path,
      groupId,
    })

    if (context.isMentioned && option === '30MinSummary') {
      // Immediate notification recipients
      return sendChatNotification({
        recipientId: userId,
        messageId: context.messageId,
        groupId,
        isMentioned: context.isMentioned,
        currentUserId,
      })
    }

    if (option === '30MinSummary') {
      const maxNotificationTime = new Date(time)
      maxNotificationTime.setMinutes(maxNotificationTime.getMinutes() + 30)

      return NotificationDigest.query().insert({
        time,
        maxNotificationTime,
        pathString: path.join('/'),
        option,
        context,
        userId,
        groupId,
      })
    }
  })

  await Promise.all(notificationPromises)
}

const deleteActionedEntries = async (groupId, options = {}) => {
  const { trx } = options

  await NotificationDigest.query(trx)
    .delete()
    .where({ actioned: true, groupId })
}

module.exports = {
  sendNotifications,
  getNotificationOptionForUser,
  notify,
  deleteActionedEntries,
}
