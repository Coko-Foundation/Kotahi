const { useTransaction, logger } = require('@coko/server')

const Config = require('../../config/config.model')
const EmailTemplate = require('../emailTemplate.model')
const defaultEmailTemplates = require('../../../config/defaultEmailTemplates')

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    logger.info(`Existing Configs count: ${configs.length}`)

    const allEmailTemplatesData = []

    if (configs.length > 0) {
      configs.forEach(async config => {
        const emailTemplatesData = defaultEmailTemplates
          .filter(template =>
            ['authorProofingInvitation', 'authorProofingSubmitted'].includes(
              template.type,
            ),
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
