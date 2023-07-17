/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Channel = require('../server/model-channel/src/channel')
/* eslint-disable-next-line import/no-unresolved */
const Group = require('../server/model-group/src/group')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      logger.info(`Existing groups count: ${groups.length}`)

      if (groups.length === 0) {
        const orphanedSystemwideChannelRecord = await Channel.query(
          trx,
        ).findOne({
          topic: 'System-wide discussion',
          type: 'editorial',
          groupId: null,
        })

        if (orphanedSystemwideChannelRecord) {
          orphanedSystemwideChannelRecord.delete()
          logger.info(`Removed orphaned system-wide discussion channel record.`)
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
