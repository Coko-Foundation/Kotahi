const EvaluationCompleteEmailTemplate = (
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
      result.subject = `The review of “${articleTitle}” is complete.`
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>Thank you for your submission to Aperture Neuro. The review of “${shortId}; ${articleTitle}, ${authorName}” is complete. Click on the link below to access your feedback.</p>
      <p><a href="https://apertureneuro.cloud68.co/login" target="_blank">https://apertureneuro.cloud68.co/login</a></p>
      <p>Thank you,</p>
      <p>Journal Manager <br>
      Aperture Neuro
      </p>
    </p>`
      break
    case 'colab':
      result.subject = `The peer review of ${articleTitle} is complete.`
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>The peer review of "${articleTitle}" is complete. Click on the link below to access your feedback.</p>
      <p><a href="#" target="_blank">Insert manuscript link</a></p>
      <p>
      Thanks, <br>
      Biophysics CoLab team
      </p>
    </p>`
      break
    default:
      result.subject = `The peer review of "${articleTitle}" is complete.`
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>The peer review of "${articleTitle}" is complete. Click on the link below to access your feedback.</p>
      <p><a href="https://kotahidev.cloud68.co/login" target="_blank">https://kotahidev.cloud68.co/login</a></p>
      <p>
      Thanks, <br>
      Kotahi Dev
      </p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = EvaluationCompleteEmailTemplate
