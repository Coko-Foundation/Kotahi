const { useTransaction, logger } = require('@coko/server')

const Channel = require('../channel.model')
const Group = require('../../group/group.model')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const channels = await Channel.query(trx)
      const groups = await Group.query(trx)

      logger.info(`Existing Channels count: ${channels.length}`)
      logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1 && channels.length >= 1 && !channels[0].group_id) {
        /* eslint no-param-reassign: "error" */
        await Channel.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        logger.info('groupId patched successfully in channels table')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
