exports.up = async knex => {
  const hasOptInColumn = await knex.schema.hasColumn(
    'users',
    'event_notifications_opt_in',
  )

  if (hasOptInColumn) {
    return knex.schema.table('users', table => {
      table.dropColumn('event_notifications_opt_in')
    })
  }

  return true
}

/**
 * Do nothing. This column needs to be removed to prevent issues with logging in a new user.
 * @returns bool
 */
exports.down = () => true
