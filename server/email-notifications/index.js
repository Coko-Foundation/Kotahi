const nodemailer = require('nodemailer')

const articleAcceptanceEmailTemplate = require('./email-templates/articleAcceptanceEmailTemplate')
const editorAssignmentEmailTemplate = require('./email-templates/editorAssignmentEmailTemplate')
const evaluationCompleteEmailTemplate = require('./email-templates/evaluationCompleteEmailTemplate')
const reviewInvitationEmailTemplate = require('./email-templates/reviewInvitationEmailTemplate')
const submissionConfirmationEmailTemplate = require('./email-templates/submissionConfirmationEmailTemplate')
const messageNotificationEmailTemplate = require('./email-templates/messageNotificationEmailTemplate')

const templates = {
  articleAcceptanceEmailTemplate,
  editorAssignmentEmailTemplate,
  evaluationCompleteEmailTemplate,
  reviewInvitationEmailTemplate,
  submissionConfirmationEmailTemplate,
  messageNotificationEmailTemplate,
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_NOTIFICATION_EMAIL_AUTH,
    pass: process.env.GMAIL_NOTIFICATION_PASSWORD,
  },
})

const sendEmail = (receiver, template, data) => {
  return new Promise(resolve => {
    const messageToReceiver = templates[template](data)

    const mailOptions = {
      from: process.env.GMAIL_NOTIFICATION_EMAIL_SENDER,
      to: receiver,
      cc: messageToReceiver.cc,
      subject: messageToReceiver.subject,
      html: messageToReceiver.content,
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        /* eslint-disable-next-line */
        console.log(error)
        resolve(false)
      } else {
        resolve(true)
        /* eslint-disable-next-line */
        console.log(`Email sent: ${info.response}`)
      }
    })
  })
}

module.exports = sendEmail
