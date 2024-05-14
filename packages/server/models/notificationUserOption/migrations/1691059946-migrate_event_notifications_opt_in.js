const { useTransaction } = require('@coko/server')

// eslint-disable-next-line import/no-unresolved, import/extensions
const NotificationUserOptions = require('../models/notificationUserOption/notificationUserOption.model')
// eslint-disable-next-line import/no-unresolved, import/extensions
const User = require('../models/user/user.model')

// eslint-disable-next-line import/no-unresolved, import/extensions
const Group = require('../models/group/group.model')

exports.up = async knex => {
  await useTransaction(async trx => {
    const users = await User.query(trx)
    const groups = await Group.query(trx)

    if (users.length > 0 && groups.length > 0) {
      const path = ['chat']

      // eslint-disable-next-line no-restricted-syntax
      for (const user of users) {
        const option = user.eventNotificationsOptIn ? 'inherit' : 'off'

        // eslint-disable-next-line no-restricted-syntax
        for (const group of groups) {
          const notificationUserOptionData = {
            userId: user.id,
            path,
            option,
            groupId: group.id,
          }

          // eslint-disable-next-line no-await-in-loop
          await new NotificationUserOptions(notificationUserOptionData)
            .$query(trx)
            .insert()
        }
      }

      // eslint-disable-next-line func-names
      await trx.schema.alterTable(User.tableName, function (table) {
        table.dropColumn('eventNotificationsOptIn')
      })
    }
  })
}
