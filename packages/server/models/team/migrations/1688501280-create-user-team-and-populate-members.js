const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const User = require('../models/user/user.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Team = require('../models/team/team.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const TeamMember = require('../models/teamMember/teamMember.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Group = require('../models/group/group.model')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      logger.info(`Existing groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1) {
        const userTeamExists = await Team.query(trx).findOne({
          role: 'user',
          global: false,
          objectId: groups[0].id,
          objectType: 'Group',
        })

        if (!userTeamExists) {
          const userTeam = await Team.query(trx).insertAndFetch({
            name: 'User',
            role: 'user',
            global: false,
            objectId: groups[0].id,
            objectType: 'Group',
          })

          logger.info(`Added ${userTeam.name} team for "${groups[0].name}".`)

          const users = await User.query(trx)

          logger.info(`Existing users count: ${users.length}`)

          let insertedRecords = 0

          await Promise.all(
            users.map(async user => {
              await TeamMember.query(trx).insert({
                userId: user.id,
                teamId: userTeam.id,
              })
              insertedRecords += 1
            }),
          ).then(res => {
            logger.info(
              `${insertedRecords}/${users.length} have been added to default user team role`,
            )
          })
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
