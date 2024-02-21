/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Team = require('../server/model-team/src/team')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../server/model-group/src/group')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const groupManagerTeam = await Team.query(trx).findOne({
        role: 'groupManager',
        objectId: null,
        objectType: null,
      })

      const groups = await Group.query(trx)

      logger.info(`Existing group manager team found: ${!!groupManagerTeam}`)
      logger.info(`Existing groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1 && groupManagerTeam) {
        /* eslint no-param-reassign: "error" */
        await Team.query(trx).patchAndFetchById(groupManagerTeam.id, {
          objectId: groups[0].id,
          objectType: 'Group',
          global: false,
        })

        logger.info(
          'groupId patched successfully in role groupManager teams table',
        )
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
