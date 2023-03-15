const GenericTaskNotificationEmailTemplate = ({
  receiverName,
  manuscriptPageUrl,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi | Task notification',
    content: '',
  }

  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>A task requires your attention<br />
      <a href="${manuscriptPageUrl}" target="_blank">${manuscriptPageUrl}</a>
      </p>
      <p>
        Regards, <br>
        Kotahi team
      </p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = GenericTaskNotificationEmailTemplate
