const { useTransaction, logger } = require('@coko/server')

const EmailTemplate = require('../emailTemplate.model')
const Group = require('../../group/group.model')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      logger.info(`Existing groups count: ${groups.length}`)

      if (groups.length === 0) {
        const orphanedEmailTemplateRecords = await EmailTemplate.query(trx)
          .delete()
          .where({
            groupId: null,
          })

        if (orphanedEmailTemplateRecords) {
          logger.info(`Removed orphaned email template records.`)
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
