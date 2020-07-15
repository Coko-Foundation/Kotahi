exports.up = async knex => {
  const { Team } = require('@pubsweet/models')
  const teams = await Team.query()

  const saves = []

  await knex.schema.table('teams', table => {
    table.uuid('object_id')
    table.string('object_type')
    table.index(['object_id', 'object_type'])
  })

  teams.forEach(team => {
    if (team.object && team.object.objectId && team.object.objectType) {
      team.objectId = team.object.objectId
      team.objectType = team.object.objectType
      delete team.object
      saves.push(team.save())
    }
  })

  await Promise.all(saves)

  return knex.schema.table('teams', table => {
    table.dropColumn('object')
  })
}
