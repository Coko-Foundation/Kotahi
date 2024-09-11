const { useTransaction } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Team = require('../models/team/team.model')
/* eslint-disable-next-line import/no-unresolved */
const TeamMember = require('../models/teamMember/teamMember.model')

/**
 * Find duplicate teams, keep one, delete the others.
 * Move all team members from dropped teams to the one you keep.
 */

exports.up = async knex => {
  const data = await knex.raw(`
      SELECT 
        role, 
        object_id, 
        COUNT(*) AS occurrences
      FROM 
        teams
      GROUP BY 
        role, 
        object_id
      HAVING 
        COUNT(*) > 1;
    `)

  if (!data || !data.rows) return

  await useTransaction(async trx => {
    await Promise.all(
      data.rows.map(async row => {
        const duplicateTeams = await Team.find(
          {
            role: row.role,
            objectId: row.object_id,
          },
          { trx },
        )

        if (duplicateTeams.totalCount <= 1)
          throw new Error(
            'Query invalid: There should be more than one duplicate teams',
          )

        const teamToKeep = duplicateTeams.result.shift()

        const teamToKeepMembers = await TeamMember.find(
          {
            teamId: teamToKeep.id,
          },
          { trx },
        )

        await Promise.all(
          duplicateTeams.result.map(async teamToDelete => {
            const membersToMove = await TeamMember.find(
              {
                teamId: teamToDelete.id,
              },
              { trx },
            )

            await Promise.all(
              membersToMove.result.map(async member => {
                // Do not move members if they already exist on the team we keep
                const exists = teamToKeepMembers.result.find(
                  m => m.userId === member.userId,
                )

                if (!exists) {
                  await member.patch(
                    {
                      teamId: teamToKeep.id,
                    },
                    { trx },
                  )
                }
              }),
            )

            await Team.deleteById(teamToDelete.id, { trx })
          }),
        )
      }),
    )
  })
}
