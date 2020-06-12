exports.up = async knex =>
  knex.schema.table('users', table => {
    table.dropColumn('fragments')
    table.dropColumn('collections')
  })
