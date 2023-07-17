/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Team = require('../server/model-team/src/team')
/* eslint-disable-next-line import/no-unresolved */
const Group = require('../server/model-group/src/group')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      logger.info(`Existing groups count: ${groups.length}`)

      if (groups.length === 0) {
        const orphanedGroupManagerRecord = await Team.query(trx).findOne({
          role: 'groupManager',
          global: true,
          objectId: null,
          objectType: null,
          type: 'team',
        })

        if (orphanedGroupManagerRecord) {
          orphanedGroupManagerRecord.delete()
          logger.info(`Removed orphaned group manager team record.`)
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
