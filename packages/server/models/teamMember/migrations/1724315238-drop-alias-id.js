exports.up = knex => {
  return knex.schema.table('team_members', table => {
    table.dropColumn('alias_id')
  })
}
