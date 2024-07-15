exports.up = async knex => {
  await knex.schema.table('collaborative_docs', table => {
    table.string('object_type')
  })
}
