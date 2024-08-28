exports.up = async knex => {
  const tableExists = await knex.schema.hasTable('teams')

  if (tableExists) {
    const columnExists = await knex.schema.hasColumn('teams', 'display_name')

    if (!columnExists) {
      return knex.schema.table('teams', table => {
        table.text('display_name')
      })
    }
  }

  return true
}
