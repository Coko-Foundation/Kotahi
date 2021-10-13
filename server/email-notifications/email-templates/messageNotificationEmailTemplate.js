const MessageNotificationEmailTemplate = ({
  articleTitle,
  authorName,
  receiverFirstName,
  shortId,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: '',
  }

  switch (process.env.INSTANCE_NAME) {
    case 'aperture':
      result.cc = 'aperture@humanbrainmapping.org'
      result.subject = 'Aperture Neuro – Message Notification'
      result.content = `<p>
      <p>Dear ${receiverFirstName},</p>
      <p>You have a message in Aperture Neuro regarding the Submission:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>Please log into the Aperture Neuro Submission Platform to review and respond to the message.</p>
      <p>Thank you,</p>
      <p>Aperture Neuro Team</p>
    </p>`
      break
    default:
      result.subject = 'Message Notification'
      result.content = `<p>
      <p>Dear ${receiverFirstName},</p>
      <p>You have a message in Aperture Neuro regarding the Submission:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>Please log into the Submission Platform to review and respond to the message.</p>
      <p>Thank you,</p>
      <p>Kotahi Dev</p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = MessageNotificationEmailTemplate
