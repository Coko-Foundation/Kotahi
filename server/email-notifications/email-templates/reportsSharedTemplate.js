const ReportsSharedTemplate = ({
  receiverName,
  submissionLink,
}) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject = 'Report(s) for Biophysics Colab available to view'
  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>One or more reports for a preprint to which you are assigned are available to view at <a href="${submissionLink}">${submissionLink}</a>. Please log in to read these reports and provide your comments using the chat function.</p>
      <p>Thank you</p>
      <p>
        On behalf of Biophysics Colab <br>
        <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
      <p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = ReportsSharedTemplate
