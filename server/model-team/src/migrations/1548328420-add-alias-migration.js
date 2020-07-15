exports.up = async knex => {
  await knex.schema.createTable('aliases', table => {
    table.uuid('id').primary()
    table.timestamp('created').defaultTo(knex.fn.now())
    table.timestamp('updated').defaultTo(knex.fn.now())
    table.string('name')
    table.string('email')
    table.string('aff')
  })

  await knex.schema.table('team_members', table => {
    table
      .uuid('alias_id')
      .references('id')
      .inTable('aliases')
  })
}
