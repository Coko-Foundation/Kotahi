const { useTransaction, logger } = require('@coko/server')

const Team = require('../team.model')
const Group = require('../../group/group.model')

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
          await Team.query().deleteById(orphanedGroupManagerRecord.id)
          logger.info(`Removed orphaned group manager team record.`)
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
