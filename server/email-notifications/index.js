const nodemailer = require('nodemailer')
const config = require('config')
const createMailOptions = require('./createMailOptions')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_NOTIFICATION_EMAIL_AUTH,
    pass: process.env.GMAIL_NOTIFICATION_PASSWORD,
  },
})

const sendEmailNotification = (receiver, template, data) => {
  const mailOptions = createMailOptions(receiver, template, data)

  if (config['notification-email'].cc_enabled === 'false') {
    mailOptions.cc = ''
  }

  // Refactor to use config object
  mailOptions.from = process.env.GMAIL_NOTIFICATION_EMAIL_SENDER

  return new Promise(resolve => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err)
        resolve(false)
        return
      }

      resolve(true)
      /* eslint-disable-next-line */
      console.info(`Email sent: ${info.response}`)
    })
  })
}

module.exports = sendEmailNotification
