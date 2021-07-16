const nodemailer = require('nodemailer')

const articleAcceptanceEmailTemplate = require('./email-templates/articleAcceptanceEmailTemplate')
const evaluationCompleteEmailTemplate = require('./email-templates/evaluationCompleteEmailTemplate')

const templates = {
  articleAcceptanceEmailTemplate,
  evaluationCompleteEmailTemplate,
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
      subject: 'Kotahi Notification Email',
      html: messageToReceiver,
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
