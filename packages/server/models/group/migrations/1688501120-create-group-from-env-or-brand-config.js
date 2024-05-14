const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Config = require('../models/config/config.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../models/group/group.model')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const configs = await Config.query(trx)

      const instanceGroups =
        process.env.INSTANCE_GROUPS &&
        process.env.INSTANCE_GROUPS.split(',')
          .map(g => g.trim())
          .filter(g => !!g)

      logger.info(`${instanceGroups}`)
      logger.info(`Existing Configs: ${configs.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (configs.length === 1 && !configs[0].group_id) {
        const splittedGroupVariables =
          instanceGroups[0] && instanceGroups[0].split(':')

        const groupName = splittedGroupVariables[0]

        const group = {
          name: groupName || 'kotahi',
          type: 'Group',
        }

        /* eslint no-param-reassign: "error" */
        await Group.query(trx).insertAndFetch(group)

        logger.info('Created initial Group data.')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
