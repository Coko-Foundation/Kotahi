const EvaluationCompleteEmailTemplate = ({
  authorFirstName,
  articleTitle,
  link,
}) => {
  const result = `<p>
      <b>Dear ${authorFirstName},</b>
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

  return result.replace(/\n/g, '')
}

module.exports = EvaluationCompleteEmailTemplate
