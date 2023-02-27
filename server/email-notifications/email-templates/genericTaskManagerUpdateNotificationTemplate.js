const GenericTaskManagerUpdateNotificationTemplate = ({
  receiverName,
  manuscriptPageUrl,
}) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject = 'Biophysics Colab task notification'
  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>A Biophysics Colab task requires your attention. Please visit <a href="${manuscriptPageUrl}">${manuscriptPageUrl}</a> to action.</p>
      <p>Thank you</p>
      <p>
        On behalf of Biophysics Colab <br>
        <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
      <p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = GenericTaskManagerUpdateNotificationTemplate
