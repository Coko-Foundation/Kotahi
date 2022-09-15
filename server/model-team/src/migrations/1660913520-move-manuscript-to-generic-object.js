const { logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Team = require('../server/model-team/src/team')

exports.up = async knex => {
  try {
    const teams = await Team.query()

    logger.info(`Total Teams: ${teams.length}`)

    const saves = []

    await knex.schema.table('teams', table => {
      table.uuid('object_id')
      table.string('object_type')
      table.index(['object_id', 'object_type'])
    })

    teams.forEach(team => {
      if (team.manuscriptId) {
        team.objectId = team.manuscriptId // eslint-disable-line no-param-reassign
        team.objectType = 'manuscript' // eslint-disable-line no-param-reassign
        delete team.manuscriptId // eslint-disable-line no-param-reassign
        saves.push(team.save())
      }
    })

    await Promise.all(saves)

    logger.info(`Total Objects: ${saves.length}`)

    return knex.schema.table('teams', table => {
      table.dropColumn('manuscriptId')
    })
  } catch (error) {
    throw new Error(error)
  }
}
