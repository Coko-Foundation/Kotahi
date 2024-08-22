exports.up = knex => {
  return knex.schema.dropTableIfExists('aliases')
}
