const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Team = require('../models/team/team.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../models/group/group.model')

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
