const models = require('@pubsweet/models')
const nodemailer = require('nodemailer')
const config = require('config')
// eslint-disable-next-line import/no-unresolved
const Handlebars = require('handlebars')

// const createMailOptions = require('./createMailOptions')

const renderTemplate = async (templateContent, data) => {
  // Compile the template
  const compiledTemplate = await Handlebars.compile(templateContent)

  // Render the template with the provided data
  const renderedTemplate = compiledTemplate(data)

  return renderedTemplate
}

const sendEmailNotification = async (receiver, template, data) => {
  const activeConfig = await models.Config.query().first() // To be replaced with group based active config in future

  let ccEmails = template.emailContent.cc || ''

  // Append additional emails to ccEmails
  if (template.emailContent?.ccEditors) {
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

  // Modify the email template using Handlebars
  mailOptions.html = await renderTemplate(template.emailContent.body, {
    ...data,
    acceptInviteLink: `<a href="${data.appUrl}/acceptarticle/${data.invitationId}" target="_blank">Accept Invitation</a>`,
    declineInviteLink: `<a href="${data.appUrl}/decline/${data.invitationId}" target="_blank">Decline Invitation</a>`,
    manuscriptTitleLink: `<a href="${data.submissionLink}">${data.manuscriptTitle}</a>`,
    manuscriptLink: `<a href="${data.manuscriptLink}" target="_blank">${data.manuscriptLink}</a>`,
    loginLink: `<a href="${data.appUrl}/login" target="_blank">${data.appUrl}/login</a>`,
  })

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
