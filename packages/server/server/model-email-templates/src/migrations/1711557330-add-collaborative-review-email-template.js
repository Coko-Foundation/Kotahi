/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Config = require('../server/config/src/config')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const EmailTemplate = require('../server/model-email-templates/src/emailTemplate')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const defaultEmailTemplates = require('../config/defaultEmailTemplates')

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    logger.info(`Existing Configs count: ${configs.length}`)

    const allEmailTemplatesData = []

    if (configs.length > 0) {
      configs.forEach(async config => {
        const emailTemplatesData = defaultEmailTemplates
          .filter(template =>
            ['collaborativeReviewerInvitation'].includes(template.type),
          )
          .map(template => ({
            emailTemplateType: template.type,
            emailContent: {
              subject: template.subject,
              cc: template.cc,
              ccEditors: template.ccEditors,
              body: template.body,
              description: template.description,
            },
            groupId: config.groupId,
          }))

        allEmailTemplatesData.push(...emailTemplatesData)
      })

      await EmailTemplate.query(trx).insertGraph(allEmailTemplatesData)

      logger.info(
        `Added authorProofingInvitation and authorProofingSubmitted templates.`,
      )
    }
  })
}
