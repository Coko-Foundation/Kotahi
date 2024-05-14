const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Config = require('../models/config/config.model')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const EmailTemplate = require('../models/emailTemplate/emailTemplate.model')

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    logger.info(`Existing Configs count: ${configs.length}`)

    if (configs.length > 0) {
      configs.forEach(async config => {
        const authorProofingInvitationTemplate =
          await EmailTemplate.query().findOne({
            groupId: config.groupId,
            emailTemplateType: 'authorProofingInvitation',
          })

        const authorProofingSubmittedTemplate =
          await EmailTemplate.query().findOne({
            groupId: config.groupId,
            emailTemplateType: 'authorProofingSubmitted',
          })

        const newConfig = config
        newConfig.formData.eventNotification.authorProofingInvitationEmailTemplate =
          authorProofingInvitationTemplate.id
        newConfig.formData.eventNotification.authorProofingSubmittedEmailTemplate =
          authorProofingSubmittedTemplate.id

        await Config.query().updateAndFetchById(config.id, newConfig)
      })

      logger.info(
        `Updated authorProofingInvitation and authorProofingSubmitted template default values for all existing configs.`,
      )
    }
  })
}
