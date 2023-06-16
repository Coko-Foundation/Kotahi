const AlertUnreadMessageDigestTemplate = ({
  receiverName,
  manuscriptPageUrl,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi | Discussion notification',
    content: '',
  }

  result.content = `<p>
        <p>Dear ${receiverName},</p>
        <p>You have new discussion messages. Click here to reply; <a href="${manuscriptPageUrl}">${manuscriptPageUrl}</a></p>
        <p>Want to change your notifications settings? Login to Kotahi and go to your profile page.</p>
        <p>Regards,<br>
        Kotahi team</p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = AlertUnreadMessageDigestTemplate
