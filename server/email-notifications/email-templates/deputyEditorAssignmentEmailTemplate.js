const deputyEditorAssignmentEmailTemplate = (
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
      result.subject = 'Aperture Neuro Submission Ready for Handling Editor'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>You have been assigned the following Research Object to Handle:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>To access the submission please log onto the Aperture Submission Kotahi platform at <a href="https://apertureneuro.cloud68.co/login" target="_blank">https://apertureneuro.cloud68.co/login</a>.</p>
      <p>If you have any questions or trouble accessing the submission, please contact the Journal Manager at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
      <p>Thank you,</p>
      <p>Mallar Chakravarty, PhD</p>
      <p>Deputy Editor-in-Chief <br>
      Aperture Neuro
      </p>
    </p>`
      break
    default:
      result.subject = 'Submission Ready for Handling Editor'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>You have been assigned the following Research Object to Handle:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>To access the submission please log onto the Submission Kotahi platform at <a href="https://kotahidev.cloud68.co/login" target="_blank">https://kotahidev.cloud68.co/login</a>.</p>
      <p>If you have any questions or trouble accessing the submission, please contact the Journal Manager.</p>
      <p>Thank you,</p>
      <p>Deputy Editor-in-Chief <br>
      Kotahi Dev
      </p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = deputyEditorAssignmentEmailTemplate
