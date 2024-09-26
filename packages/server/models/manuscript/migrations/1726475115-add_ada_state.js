exports.up = async knex => {
  const tableExists = await knex.schema.hasTable('manuscripts')

  if (tableExists) {
    const columnExists = await knex.schema.hasColumn('manuscripts', 'ada_state')

    if (!columnExists) {
      return knex.schema.table('manuscripts', table => {
        table.text('ada_state')
      })
    }
  }

  return true
}

exports.down = async knex =>
  knex.schema.table('manuscripts', table => {
    table.dropColumn('ada_state')
  })
