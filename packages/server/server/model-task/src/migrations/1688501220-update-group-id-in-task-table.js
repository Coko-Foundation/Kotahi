/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Task = require('../server/model-task/src/task')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../server/model-group/src/group')

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
