import { convertTimestampToDateString } from '../../../../../shared/dateUtils'

export const sendEmail = async (
  manuscript,
  isNewUser,
  currentUser,
  sendNotifyEmail,
  selectedTemplate,
  selectedEmail,
  externalEmail,
  externalName,
  selectedEmailIsBlacklisted,
  groupId,
) => {
  if (selectedEmailIsBlacklisted) return undefined
  if (!selectedTemplate || !manuscript) return undefined

  const input = isNewUser
    ? {
        externalEmail,
        externalName,
        selectedTemplate,
        manuscript,
        currentUser: currentUser.username,
        groupId,
      }
    : {
        selectedEmail,
        selectedTemplate,
        manuscript,
        currentUser: currentUser.username,
        groupId,
      }

  if (isNewUser && (!externalName || !externalEmail)) return undefined
  if (!isNewUser && !selectedEmail) return undefined

  const response = await sendNotifyEmail(input)
  const emailStatus = response.data.sendEmail.response.success
  const { invitation } = response.data.sendEmail
  if (invitation) return { invitation, input, emailStatus }
  return undefined
}

export const sendEmailChannelMessage = async (
  sendChannelMessage,
  currentUser,
  input,
  options,
  emailTemplates,
  reviewers = [],
) => {
  const emailNotificationOptions = emailTemplates.map(template => {
    const emailOption = {
      label: template.emailContent.description,
      value: template.id,
      type: template.emailTemplateType,
    }

    return emailOption
  })

  const selectedTempl = emailNotificationOptions.find(
    template => template.value === input.selectedTemplate,
  )

  let receiverName

  if (reviewers.length !== 0) {
    receiverName = input.externalEmail
      ? input.externalName
      : reviewers.find(user => user.value === input.selectedEmail).userName
  } else {
    receiverName = input.externalEmail
      ? input.externalName
      : options.find(user => user.value === input.selectedEmail).userName
  }

  const date = Date.now()

  const body = `${convertTimestampToDateString(date)} - ${
    selectedTempl.label
  } sent by ${currentUser.username} to ${receiverName}`

  const channelId = input.manuscript.channels.find(
    channel => channel.topic === 'Editorial discussion',
  ).id

  await sendChannelMessage({ content: body, channelId })
}
