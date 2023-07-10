const SubmissionConfirmationEmailTemplate = (
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
      result.subject = 'Aperture Neuro – Received Research Object Submission'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>Thank you for your submission.</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>We have successfully received your Research Object, and it is currently under review. You can check the status of your submission at any time by logging into the publishing platform and navigating to your dashboard.</p>
      <p>If you have any questions, please contact the Aperture Neuro Journal Manager, at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
      <p>Thank you,</p>
      </p>Journal Manager <br>
      Aperture Neuro
      </p>
    </p>`
      break
    default:
      result.subject = 'Received Research Object Submission'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>Thank you for your submission.</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>We have successfully received your Research Object, and it is currently under review. You can check the status of your submission at any time by logging into the publishing platform and navigating to your dashboard.</p>
      <p>Thank you,</p>
      </p>Kotahi Dev</p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = SubmissionConfirmationEmailTemplate
