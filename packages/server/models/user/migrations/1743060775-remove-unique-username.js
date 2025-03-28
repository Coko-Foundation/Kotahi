exports.up = async knex => {
  try {
    await knex.schema.alterTable('users', table => {
      table.dropUnique(['username'], 'users_username_key')
    })
    return true
  } catch (e) {
    throw new Error(`Migration: User: drop unique username failed: ${e}`)
  }
}

exports.down = async knex => {
  try {
    await knex.schema.alterTable('users', table => {
      table.unique(['username'], { indexName: 'users_username_key' })
    })
    return true
  } catch (e) {
    throw new Error(`Migration: User: create unique username failed: ${e}`)
  }
}
