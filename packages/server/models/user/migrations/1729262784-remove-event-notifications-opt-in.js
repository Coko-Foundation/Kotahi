exports.up = knex => {
  return knex.schema.table('users', table => {
    table.dropColumn('eventNotificationsOptIn')
  })
}

/**
 * Do nothing. This column needs to be removed to prevent issues with logging in a new user.
 * @returns bool
 */
exports.down = () => true
