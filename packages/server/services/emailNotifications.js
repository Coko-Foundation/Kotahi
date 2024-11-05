const nodemailer = require('nodemailer')
const config = require('config')
// eslint-disable-next-line import/no-unresolved
const Handlebars = require('handlebars')

const { clientUrl } = require('@coko/server')

const Config = require('../models/config/config.model')
const Group = require('../models/group/group.model')

const renderTemplate = async (templateContent, data) => {
  // Compile the template
  const compiledTemplate = await Handlebars.compile(templateContent)

  // Render the template with the provided data
  const renderedTemplate = compiledTemplate(data)

  return renderedTemplate
}

const sendEmailNotification = async (receiver, template, data, groupId) => {
  const activeConfig = await Config.getCached(groupId)
  const group = await Group.query().findById(groupId)

  let ccEmails = template.emailContent?.cc || ''

  // If the template requires sending emails to the editors, then append
  // data.ccEmails which would be an array of editor emails
  if (template.emailContent?.ccEditors && data.ccEmails) {
    ccEmails += `,${data.ccEmails.join(',')}`
  }

  const mailOptions = {
    to: receiver,
    cc: ccEmails,
    subject: template.emailContent?.subject,
    html: template.emailContent.body,
  }

  // Modify the subject using Handlebars
  mailOptions.subject = await renderTemplate(
    template.emailContent.subject,
    data,
  )

  const appUrl = `${clientUrl}/${group.name}`

  // Modify the email template using Handlebars
  mailOptions.html = await renderTemplate(template.emailContent.body, {
    ...data,
    acceptInviteLink: `<a href="${appUrl}/acceptarticle/${data.invitationId}" target="_blank">Accept Invitation</a>`,
    declineInviteLink: `<a href="${appUrl}/decline/${data.invitationId}" target="_blank">Decline Invitation</a>`,
    loginLink: `<a href="${appUrl}/login" target="_blank">${appUrl}/login</a>`,
    manuscriptTitleLink: `<a href="${data.manuscriptTitleLink}">${data.manuscriptTitle}</a>`,
    manuscriptLink: `<a href="${data.manuscriptLink}" target="_blank">${data.manuscriptLink}</a>`,
    manuscriptProductionLink: `<a href="${data.manuscriptProductionLink}" target="_blank">${data.manuscriptProductionLink}</a>`,
  })

  mailOptions.from = {
    name: activeConfig.formData.notification.gmailSenderName,
    address: activeConfig.formData.notification.gmailAuthEmail,
  }

  // Override recipient(s) if not running in production.
  // To avoid inadvertently emailing customers during testing/debugging.

  const { hostname } = new URL(clientUrl)
  const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)

  if (process.env.NODE_ENV !== 'production' || isLocalHost) {
    const description = `email with subject '${mailOptions.subject}' to ${
      mailOptions.to
    }${
      mailOptions.cc && ` (CCing ${mailOptions.cc})`
    }, because Kotahi is running in ${process.env.NODE_ENV} mode on ${hostname}`

    const overrideRecipient =
      config['notification-email'].testEmailRecipient || ''

    if (!overrideRecipient) {
      // eslint-disable-next-line no-console
      console.log(
        `Suppressing ${description}. Set TEST_EMAIL_RECIPIENT in your .env file if you wish to redirect rather than suppress emails.`,
      )
      return true
    }

    // eslint-disable-next-line no-console
    console.log(
      `Overriding recipient(s) for ${description}. This is instead being sent to ${overrideRecipient}.`,
    )

    mailOptions.to = overrideRecipient
    mailOptions.cc = ''
    mailOptions.bcc = ''
  }

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
