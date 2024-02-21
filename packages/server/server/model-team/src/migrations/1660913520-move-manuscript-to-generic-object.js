const { logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Team = require('../server/model-team/src/team')

exports.up = async knex => {
  try {
    await knex.schema.table('teams', table => {
      table.uuid('object_id')
      table.string('object_type')
      table.index(['object_id', 'object_type'])
    })

    const teams = await Team.query()

    logger.info(`Total Teams: ${teams.length}`)

    const updatedTeams = []

    teams.forEach(async team => {
      if (team.manuscriptId) {
        const saved = await Team.query().patchAndFetchById(team.id, {
          objectId: team.manuscriptId,
          objectType: 'manuscript',
        })

        updatedTeams.push(saved)
      }
    })

    await Promise.all(updatedTeams).then(
      logger.info(`Total Objects: ${updatedTeams.length}`),
    )

    return knex.schema.table('teams', table => {
      table.dropColumn('manuscriptId')
    })
  } catch (error) {
    throw new Error(error)
  }
}
