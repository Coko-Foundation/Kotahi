/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const { logger } = require('@coko/server')

exports.up = async knex => {
  // eslint-disable-next-line global-require
  const { User, Identity } = require('@pubsweet/models')
  const users = await User.query().withGraphFetched('defaultIdentity')

  for (const user of users) {
    // To make the migration idempotent
    if (!user.defaultIdentity) {
      try {
        await new Identity({
          type: 'local',
          userId: user.id,
          isDefault: true,
        }).save()
      } catch (e) {
        logger.error(e)
      }
    }
  }
}
