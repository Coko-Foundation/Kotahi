const { useTransaction, logger } = require('@coko/server')

const Channel = require('../channel.model')
const Group = require('../../group/group.model')

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
          await Channel.query().deleteById(orphanedSystemwideChannelRecord.id)
          logger.info(`Removed orphaned system-wide discussion channel record.`)
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
