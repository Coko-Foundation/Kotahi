const { logger, db } = require('@coko/server')
// const { Journal, User } = require('@pubsweet/models')
const { createTables } = require('@pubsweet/db-manager')

const clearDb = async () => {
  const { rows } = await db.raw(`
    SELECT tablename, schemaname
    FROM pg_tables
    WHERE schemaname = 'public' OR schemaname = 'pgboss'
  `)

  if (rows.length) {
    logger.info('Overwriting existing database')
    // TODO this is dangerous, change it
    let dropQuery = rows.map(
      row => `DROP TABLE ${row.schemaname}.${row.tablename} CASCADE`,
    )

    // Also delete the pgboss.job_state type
    dropQuery.push('DROP TYPE IF EXISTS pgboss.job_state')

    // Also delete the schema
    dropQuery.push('DROP SCHEMA pgboss')

    dropQuery = dropQuery.join('; ')

    await db.raw(dropQuery)
  }
}

const seed = async dumpSql => {
  let ready

  if (dumpSql) {
    await clearDb()
    await db.raw(dumpSql)
    logger.info('Cleared the database and restored from dump')
  } else {
    await createTables(true)
  }

  // TODO: This wait is necessary for the database to "settle".
  while (!ready) {
    // eslint-disable-next-line
    const result = await db.raw(`set search_path to 'public';`)
    // eslint-disable-next-line global-require
    const { User } = require('@pubsweet/models')

    try {
      // eslint-disable-next-line
      const users = await User.query()
      ready = !!users
    } catch (e) {
      // eslint-disable-next-line
      console.log(e)
    }
  }

  return true
}

if (require.main === module) {
  seed()
}

module.exports = seed
