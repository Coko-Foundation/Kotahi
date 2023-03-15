const GenericTaskNotificationEmailTemplate = ({ receiverName }) => {
  const result = {
    cc: '',
    subject: 'Kotahi | Task notification',
    content: '',
  }

  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>A task requires your attention</p>
      <p>
        Regards, <br>
        Kotahi team
      </p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = GenericTaskNotificationEmailTemplate
