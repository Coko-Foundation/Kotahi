const ReviewAssignmentEmailTemplate = (
  { articleTitle, authorName, receiverName, shortId },
  instanceName,
) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notificaion Email',
    content: '',
  }

  switch (instanceName) {
    case 'aperture':
      result.cc = 'aperture@humanbrainmapping.org'
      result.subject = 'Aperture Neuro – Submission Ready for Review'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>Thank you for agreeing to review for Aperture Neuro. You have now been assigned to the following submission:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>You can access the full manuscript to review by logging into your dashboard at <a href="https://apertureneuro.cloud68.co/login" target="_blank">https://apertureneuro.cloud68.co/login</a>.</p>
      <p>For any questions please contact the journal manager at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
      <p>Thank you,</p>
      <p>Journal Manager <br>
      Aperture Neuro
      </p>
    </p>`
      break
    default:
      result.subject = 'Submission Ready for Handling Editor'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>Thank you for agreeing to review for Aperture Neuro. You have now been assigned to the following submission:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>You can access the full manuscript to review by logging into your dashboard at <a href="https://kotahidev.cloud68.co/login" target="_blank">https://kotahidev.cloud68.co/login</a>.</p>
      <p>For any questions please contact the journal manager.</p>
      <p>Thank you,</p>
      <p>
      Kotahi Dev
      </p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReviewAssignmentEmailTemplate
