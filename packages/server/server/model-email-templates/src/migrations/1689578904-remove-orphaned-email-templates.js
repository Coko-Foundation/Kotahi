/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const EmailTemplate = require('../server/model-email-templates/src/emailTemplate')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../server/model-group/src/group')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      logger.info(`Existing groups count: ${groups.length}`)

      if (groups.length === 0) {
        const orphanedEmailTemplateRecords = await EmailTemplate.query(trx)
          .where({
            groupId: null,
          })
          .delete()

        if (orphanedEmailTemplateRecords) {
          logger.info(`Removed orphaned email template records.`)
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
