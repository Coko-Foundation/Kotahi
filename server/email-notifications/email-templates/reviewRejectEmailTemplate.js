const ReviewRejectEmailTemplate = (
  { articleTitle, authorName, reviewerName, receiverName, shortId },
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
      result.subject = 'Reviewer has rejected review invitation'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>Reviewer ${reviewerName} has rejected your review invitation. Please log into the publishing platform and invite another reviewer to the submission:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>Thank you,</p>
      <p>Aperture Neuro Team</p>
    </p>`
      break
    default:
      result.subject = 'Reviewer has rejected review invitation'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>Reviewer ${reviewerName} has rejected your review invitation. Please log into the publishing platform and invite another reviewer to the submission:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>Thank you,</p>
      <p>Kotahi Dev</p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReviewRejectEmailTemplate
