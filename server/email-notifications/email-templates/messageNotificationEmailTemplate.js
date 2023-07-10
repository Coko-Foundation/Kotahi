const MessageNotificationEmailTemplate = (
  { articleTitle, authorName, receiverName, shortId },
  instanceName,
) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: '',
  }

  switch (instanceName) {
    case 'aperture':
      result.cc = 'aperture@humanbrainmapping.org'
      result.subject = 'Aperture Neuro – Message Notification'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>You have a message in Aperture Neuro regarding the Submission:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>Please log into the Aperture Neuro Submission Platform at <a href="https://apertureneuro.cloud68.co/login" target="_blank">https://apertureneuro.cloud68.co/login</a> to review and respond to the message.</p>
      <p>Thank you,</p>
      <p>Aperture Neuro Team</p>
    </p>`
      break
    default:
      result.subject = 'Message Notification'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
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
