exports.up = async knex => {
  const columnExists = await knex.schema.hasColumn('teams', 'display_name')

  if (columnExists) {
    return knex.schema.table('teams', table => {
      table.dropColumn('display_name')
    })
  }

  return true
}
