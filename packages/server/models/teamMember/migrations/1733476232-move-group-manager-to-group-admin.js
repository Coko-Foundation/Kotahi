const { logger, useTransaction } = require('@coko/server')

const Group = require('../../group/group.model')
const Team = require('../../team/team.model')
const TeamMember = require('../teamMember.model')

exports.up = async knex => {
  return useTransaction(async trx => {
    const groups = await Group.query(trx)

    await Promise.all(
      groups.map(async group => {
        let groupManagerTeam = await Team.query(trx)
          .withGraphFetched('members')
          .findOne({ global: false, objectId: group.id, role: 'groupManager' })

        if (!groupManagerTeam) {
          groupManagerTeam = await Team.query(trx).insertAndFetch({
            displayName: 'Group Manager',
            role: 'groupManager',
            global: false,
            objectId: group.id,
            objectType: 'Group',
          })

          logger.info(
            `    Added ${groupManagerTeam.displayName} team for "${group.name}".`,
          )
        }

        let groupAdminTeam = await Team.query(trx)
          .withGraphFetched('members')
          .findOne({
            global: false,
            objectId: group.id,
            role: 'groupAdmin',
          })

        if (!groupAdminTeam) {
          groupAdminTeam = await Team.query(trx).insertAndFetch({
            displayName: 'Group Admin',
            role: 'groupAdmin',
            global: false,
            objectId: group.id,
            objectType: 'Group',
          })

          logger.info(
            `    Added ${groupAdminTeam.displayName} team for "${group.name}".`,
          )
        }

        const groupAdminUserIds = groupAdminTeam.members.map(m => m.userId)

        const groupManagerUserIds = groupManagerTeam.members
          .map(m => m.userId)
          .filter(m => !groupAdminUserIds.includes(m))

        await TeamMember.query(trx)
          .delete()
          .where({ teamId: groupManagerTeam.id })
          .whereIn('userId', groupManagerUserIds)

        if (groupManagerUserIds.length > 0) {
          await TeamMember.query(trx).insert(
            groupManagerUserIds.map(userId => ({
              teamId: groupAdminTeam.id,
              userId,
            })),
          )
        }
      }),
    )

    logger.info('successfully migrated group managers to group admins')
  })
}

exports.down = async knex => {
  return useTransaction(async trx => {
    const groups = await Group.query(trx)

    await Promise.all(
      groups.map(async group => {
        let groupAdminTeam = await Team.query(trx)
          .withGraphFetched('members')
          .findOne({
            global: false,
            objectId: group.id,
            role: 'groupAdmin',
          })

        if (!groupAdminTeam) {
          groupAdminTeam = await Team.query(trx).insertAndFetch({
            displayName: 'Group Admin',
            role: 'groupAdmin',
            global: false,
            objectId: group.id,
            objectType: 'Group',
          })

          logger.info(
            `    Added ${groupAdminTeam.displayName} team for "${group.name}".`,
          )
        }

        let groupManagerTeam = await Team.query(trx)
          .withGraphFetched('members')
          .findOne({ global: false, objectId: group.id, role: 'groupManager' })

        if (!groupManagerTeam) {
          groupManagerTeam = await Team.query(trx).insertAndFetch({
            displayName: 'Group Manager',
            role: 'groupManager',
            global: false,
            objectId: group.id,
            objectType: 'Group',
          })

          logger.info(
            `    Added ${groupManagerTeam.displayName} team for "${group.name}".`,
          )
        }

        const groupManagerUserIds = groupManagerTeam.members.map(m => m.userId)

        const groupAdminUserIds = groupAdminTeam.members
          .map(m => m.userId)
          .filter(m => !groupManagerUserIds.includes(m))

        await TeamMember.query(trx)
          .delete()
          .where({ teamId: groupAdminTeam.id })
          .whereIn('userId', groupAdminUserIds)

        if (groupAdminUserIds.length > 0) {
          await TeamMember.query(trx).insert(
            groupAdminUserIds.map(userId => ({
              teamId: groupManagerTeam.id,
              userId,
            })),
          )
        }
      }),
    )

    logger.info('successfully reverted group admins to group managers')
  })
}
