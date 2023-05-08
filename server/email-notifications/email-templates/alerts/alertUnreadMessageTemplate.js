const AlertUnreadMessageTemplate = ({ receiverName, manuscriptPageUrl }) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.subject = 'You have unread messages!'
  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>You have unread messages in chat. Please visit <a href="${manuscriptPageUrl}">${manuscriptPageUrl}</a> to read them.</p>
      <p>Thank you</p>
      <p>
        On behalf of Biophysics Colab <br>
        <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
      <p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = AlertUnreadMessageTemplate
