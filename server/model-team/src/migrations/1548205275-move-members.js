exports.up = async knex => {
  const { Team, TeamMember } = require('@pubsweet/models')
  const teams = await Team.query()

  const saves = []

  teams.forEach(team => {
    if (team.members) {
      team.members.forEach(member => {
        saves.push(new TeamMember({ userId: member, teamId: team.id }).save())
      })
    }
  })

  await Promise.all(saves)

  return knex.schema.table('teams', table => {
    table.dropColumn('members')
  })
}
