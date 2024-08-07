/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const { logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const User = require('../models/user/user.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Identity = require('../models/identity/identity.model')

exports.up = async knex => {
  const users = await User.query().withGraphFetched('defaultIdentity')

  for (const user of users) {
    // To make the migration idempotent
    if (!user.defaultIdentity) {
      try {
        await Identity.query().insert({
          type: 'local',
          userId: user.id,
          isDefault: true,
        })
      } catch (e) {
        logger.error(e)
      }
    }
  }
}
