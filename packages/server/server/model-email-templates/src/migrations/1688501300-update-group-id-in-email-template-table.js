/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const EmailTemplate = require('../server/model-email-templates/src/emailTemplate')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../server/model-group/src/group')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const emailTemplates = await EmailTemplate.query(trx)
      const groups = await Group.query(trx)

      logger.info(`Existing Email templates count: ${emailTemplates.length}`)
      logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (
        groups.length >= 1 &&
        emailTemplates.length >= 1 &&
        !emailTemplates[0].group_id
      ) {
        /* eslint no-param-reassign: "error" */
        await EmailTemplate.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        logger.info('groupId patched successfully in email template table')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
