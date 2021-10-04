const EvaluationCompleteEmailTemplate = ({
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
      result.subject = `The peer review of ${articleTitle} is complete.`
      result.content = `<p>
      <b>Dear ${receiverFirstName},</b>
      <br>
      <br>
      <p>Thank you for your submission to Aperture Neuro. The peer review of ${articleTitle} is complete. Click on the link below to access your feedback.</p>
      <br>
      <p>
      Thank you, <br>
      Kay Vanda <br>
      Journal Manager <br>
      Aperture Neuro
      </p>
    </p>`
      break
    case 'colab':
      result.subject = `The peer review of ${articleTitle} is complete.`
      result.content = `<p>
      <b>Dear ${receiverFirstName},</b>
      <br>
      <br>
      <p>The peer review of ${articleTitle} is complete. Click on the link below to access your feedback.</p>
      <br>
      <br>
      <a href=${link} target="_blank">Insert manuscript link</a>
      <br>
      <br>
      <p>
      Thanks, <br>
      Biophysics CoLab team
      </p>
    </p>`
      break
    default:
      result.subject = `The peer review of ${articleTitle} is complete.`
      result.content = `<p>
      <b>Dear ${receiverFirstName},</b>
      <br>
      <br>
      <p>The peer review of ${articleTitle} is complete. Click on the link below to access your feedback.</p>
      <br>
      <br>
      <a href=${link} target="_blank">Insert manuscript link</a>
      <br>
      <br>
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
