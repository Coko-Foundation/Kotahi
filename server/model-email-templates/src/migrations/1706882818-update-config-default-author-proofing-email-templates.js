/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Config = require('../server/config/src/config')

/* eslint-disable-next-line import/no-unresolved */
const EmailTemplate = require('../server/model-email-templates/src/emailTemplate')

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    logger.info(`Existing Configs count: ${configs.length}`)

    if (configs.length > 0) {
      configs.forEach(async config => {
        const authorProofingInvitationTemplate = await EmailTemplate.query().findOne(
          {
            groupId: config.groupId,
            emailTemplateType: 'authorProofingInvitation',
          },
        )

        const authorProofingSubmittedTemplate = await EmailTemplate.query().findOne(
          {
            groupId: config.groupId,
            emailTemplateType: 'authorProofingSubmitted',
          },
        )

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
