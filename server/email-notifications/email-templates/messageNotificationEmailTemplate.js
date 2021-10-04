const MessageNotificationEmailTemplate = ({
  articleTitle,
  link,
  receiverFirstName,
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
      <b>Dear ${receiverFirstName},</b>
      <br>
      <br>
      <p>You have a message in Aperture Neuro regarding the Submission.</p>
      <br>
      <p>Research Object Title: ${articleTitle}</p>
      <br>
      <p>Please log into the Aperture Neuro Submission Platform to review and respond to the message.</p>
      <p>The Journal Manager will be in touch with you with any questions should they arise. If you have any questions, please contact Kay Vanda, the Aperture Neuro Journal Manager, at aperture@humanbrainmapping.org.</p>
      <p>
      Thank you, 
      <br>
      <br>
      Aperture Neuro Team
      </p>
    </p>`
      break
    default:
      result.subject = 'Message Notification'
      result.content = `<p>
      <b>Dear ${receiverFirstName},</b>
      <br>
      <br>
      <p>You have a message in Kotahi regarding the Submission.</p>
      <br>
      <p>Research Object Title: ${articleTitle}</p>
      <br>
      <p>Please log into the Kotahi Submission Platform to review and respond to the message.</p>
      <p>
      Thank you, 
      <br>
      <br>
      Kothai Dev
      </p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = MessageNotificationEmailTemplate
