exports.up = knex =>
  knex.schema.createTable('team_members', table => {
    table.uuid('id').primary()
    table.timestamp('created').defaultTo(knex.fn.now())
    table.timestamp('updated').defaultTo(knex.fn.now())
    table.string('status')
    table
      .uuid('team_id')
      .references('id')
      .inTable('teams')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    table
      .uuid('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['team_id', 'user_id'])
  })
