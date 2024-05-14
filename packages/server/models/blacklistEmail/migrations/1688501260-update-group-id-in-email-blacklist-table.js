const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const BlacklistEmail = require('../models/blacklistEmail/blacklistEmail.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../models/group/group.model')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const blacklistEmails = await BlacklistEmail.query(trx)
      const groups = await Group.query(trx)

      logger.info(`Existing BlacklistEmails count: ${blacklistEmails.length}`)
      logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (
        groups.length >= 1 &&
        blacklistEmails.length >= 1 &&
        !blacklistEmails[0].group_id
      ) {
        /* eslint no-param-reassign: "error" */
        await BlacklistEmail.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        logger.info('groupId patched successfully in blacklist email table')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
