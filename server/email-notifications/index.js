const models = require('@pubsweet/models')
const nodemailer = require('nodemailer')
const config = require('config')
const createMailOptions = require('./createMailOptions')

const sendEmailNotification = async (receiver, template, data) => {
  const activeConfig = await models.Config.query().first() // To be replaced with group based active config in future

  const mailOptions = createMailOptions(receiver, template, data)

  if (config['notification-email'].cc_enabled === 'false') {
    mailOptions.cc = ''
  }

  mailOptions.from = activeConfig.formData.notification.gmailSenderEmail

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: activeConfig.formData.notification.gmailAuthEmail,
      pass: activeConfig.formData.notification.gmailAuthPassword,
    },
  })

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
