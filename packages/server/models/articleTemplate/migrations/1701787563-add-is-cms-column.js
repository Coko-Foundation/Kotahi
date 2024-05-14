exports.up = async knex => {
  await knex.schema.table('article_templates', table => {
    table.boolean('is_cms').notNullable().defaultTo('false')
  })
}
