const { useTransaction, logger } = require('@coko/server')

const Task = require('../task.model')
const Group = require('../../group/group.model')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const tasks = await Task.query(trx)
      const groups = await Group.query(trx)

      logger.info(`Existing Tasks count: ${tasks.length}`)
      logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1 && tasks.length >= 1 && !tasks[0].group_id) {
        /* eslint no-param-reassign: "error" */
        await Task.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        logger.info('groupId patched successfully in tasks table')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
