const EditorAssignmentEmailTemplate = ({
  articleTitle,
  link,
  receiverFirstName,
  shortId,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notificaion Email',
    content: '',
  }

  switch (process.env.INSTANCE_NAME) {
    case 'aperture':
      result.subject = 'Aperture Neuro Submission Ready for Handling Editor'
      result.content = `<p>
      <b>Hello ${receiverFirstName},</b>
      <br>
      <br>
      <p>You have been assigned the following Research Object to Handle:</p>
      <br>
      <p>
      Number: ${shortId} <br>
      Title: ${articleTitle}
      </p>
      <br>
      <p>To access the submission please log onto the Aperture Submission Kotahi platform at <a href="https://aperturedev.cloud68.co/login" target="_blank">Login to Aperture</a>.</p>
      <p>If you have any questions or trouble accessing the submission, please contact the Journal Manager at aperture@humanbrainmapping.org.</p>
      <p>
      Sincerely, <br>
      Tonya White / Mallar Chakravarty <br>
      Editor-in-Chief <br>
      </p>
    </p>`
      break
    default:
      result.subject = 'Submission Ready for Handling Editor'
      result.content = `<p>
      <b>Hello ${receiverFirstName},</b>
      <br>
      <br>
      <p>You have been assigned the following Research Object to Handle:</p>
      <br>
      <p>
      Title: ${articleTitle}
      </p>
      <br>
      <p>To access the submission please log onto the Submission Kotahi platform at <a href="https://kotahidev.cloud68.co/login" target="_blank">Login to Kotahi</a>.</p>
      <br>
      <br>
      <p>
      Sincerely, <br>
      Editor-in-Chief<br>
      </p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = EditorAssignmentEmailTemplate
