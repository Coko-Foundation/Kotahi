/* eslint-disable no-unused-vars */
const { logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Channel = require('../server/model-channel/src/channel')

exports.up = async knex => {
  try {
    const channelsWithMissingGroup = await Channel.query(knex)
      .whereNull('groupId')
      .withGraphFetched('manuscript')

    if (channelsWithMissingGroup.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const channel of channelsWithMissingGroup) {
        if (channel.manuscriptId) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await Channel.query(knex)
              .where('id', channel.id)
              .patch({ groupId: channel.manuscript.groupId })
          } catch (error) {
            logger.error(
              `Error updating channel ${channel.id} for missing group: ${error.message}`,
            )
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log(
        `Updated ${channelsWithMissingGroup.length} channel records to add the missing group_id`,
      )
    } else {
      logger.error('No channels found with missing group id.')
    }
  } catch (error) {
    logger.error(`Error updating channels: ${error.message}`)
  }
}
