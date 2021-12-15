const nodemailer = require('nodemailer')

// TODO: refactor below template logic
const adhocEditorAssignmentEmailTemplate = require('./email-templates/adhocEditorAssignmentEmailTemplate')
const articleAcceptanceEmailTemplate = require('./email-templates/articleAcceptanceEmailTemplate')
const deputyEditorAssignmentEmailTemplate = require('./email-templates/deputyEditorAssignmentEmailTemplate')
const editorAssignmentEmailTemplate = require('./email-templates/editorAssignmentEmailTemplate')
const evaluationCompleteEmailTemplate = require('./email-templates/evaluationCompleteEmailTemplate')
const messageNotificationEmailTemplate = require('./email-templates/messageNotificationEmailTemplate')
const reviewAssignmentEmailTemplate = require('./email-templates/reviewAssignmentEmailTemplate')
const reviewCompleteEmailTemplate = require('./email-templates/reviewCompleteEmailTemplate')
const reviewRejectEmailTemplate = require('./email-templates/reviewRejectEmailTemplate')
const submissionConfirmationEmailTemplate = require('./email-templates/submissionConfirmationEmailTemplate')
const reviewInvitationEmailTemplate1 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate1')
const reviewInvitationEmailTemplate2 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate2')
const reviewInvitationEmailTemplate3 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate3')
const reviewInvitationEmailTemplate4 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate4')
const reviewInvitationEmailTemplate5 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate5')
const reviewInvitationEmailTemplate6 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate6')
const reviewInvitationEmailTemplate7 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate7')
const reviewInvitationEmailTemplate8 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate8')
const reviewInvitationEmailTemplate9 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate9')
const reviewInvitationEmailTemplate10 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate10')
const reviewInvitationEmailTemplate11 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate11')
const reviewInvitationEmailTemplate12 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate12')
const reviewInvitationEmailTemplate13 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate13')
const reviewInvitationEmailTemplate14 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate14')
const reviewInvitationEmailTemplate15 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate15')
const reviewInvitationEmailTemplate16 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate16')
const reviewInvitationEmailTemplate17 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate17')
const reviewInvitationEmailTemplate18 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate18')
const reviewInvitationEmailTemplate19 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate19')
const reviewInvitationEmailTemplate20 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate20')
const reviewInvitationEmailTemplate21 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate21')
const reviewInvitationEmailTemplate22 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate22')
const reviewInvitationEmailTemplate23 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate23')
const reviewInvitationEmailTemplate24 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate24')
const reviewInvitationEmailTemplate25 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate25')
const reviewInvitationEmailTemplate26 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate26')
const reviewInvitationEmailTemplate27 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate27')
const reviewInvitationEmailTemplate28 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate28')
const reviewInvitationEmailTemplate30 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate30')
const reviewInvitationEmailTemplate31 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate31')
const reviewInvitationEmailTemplate32 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate32')
const reviewInvitationEmailTemplate33 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate33')
const reviewInvitationEmailTemplate34 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate34')
const reviewInvitationEmailTemplate35 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate35')
const reviewInvitationEmailTemplate36 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate36')
const reviewInvitationEmailTemplate37 = require('./email-templates/review-invitations/reviewInvitationEmailTemplate37')

const templates = {
  adhocEditorAssignmentEmailTemplate,
  articleAcceptanceEmailTemplate,
  deputyEditorAssignmentEmailTemplate,
  editorAssignmentEmailTemplate,
  evaluationCompleteEmailTemplate,
  messageNotificationEmailTemplate,
  reviewAssignmentEmailTemplate,
  reviewCompleteEmailTemplate,
  reviewRejectEmailTemplate,
  submissionConfirmationEmailTemplate,
  reviewInvitationEmailTemplate1, // TODO: change the below logic to dynamic
  reviewInvitationEmailTemplate2,
  reviewInvitationEmailTemplate3,
  reviewInvitationEmailTemplate4,
  reviewInvitationEmailTemplate5,
  reviewInvitationEmailTemplate6,
  reviewInvitationEmailTemplate7,
  reviewInvitationEmailTemplate8,
  reviewInvitationEmailTemplate9,
  reviewInvitationEmailTemplate10,
  reviewInvitationEmailTemplate11,
  reviewInvitationEmailTemplate12,
  reviewInvitationEmailTemplate13,
  reviewInvitationEmailTemplate14,
  reviewInvitationEmailTemplate15,
  reviewInvitationEmailTemplate16,
  reviewInvitationEmailTemplate17,
  reviewInvitationEmailTemplate18,
  reviewInvitationEmailTemplate19,
  reviewInvitationEmailTemplate20,
  reviewInvitationEmailTemplate21,
  reviewInvitationEmailTemplate22,
  reviewInvitationEmailTemplate23,
  reviewInvitationEmailTemplate24,
  reviewInvitationEmailTemplate25,
  reviewInvitationEmailTemplate26,
  reviewInvitationEmailTemplate27,
  reviewInvitationEmailTemplate28,
  reviewInvitationEmailTemplate30,
  reviewInvitationEmailTemplate31,
  reviewInvitationEmailTemplate32,
  reviewInvitationEmailTemplate33,
  reviewInvitationEmailTemplate34,
  reviewInvitationEmailTemplate35,
  reviewInvitationEmailTemplate36,
  reviewInvitationEmailTemplate37,
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
