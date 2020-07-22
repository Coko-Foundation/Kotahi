const logger = require('@pubsweet/logger')
// const { Journal, User } = require('@pubsweet/models')
const { createTables, db } = require('@pubsweet/db-manager')
const wait = require('waait')

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
  if (dumpSql) {
    await clearDb()
    await db.raw(dumpSql)
    logger.info('Cleared the database and restored from dump')
    // TODO: This wait is necessary for the database to settle
    await wait(2000)
    return true
  }

  await createTables(true)

  return true
}

if (require.main === module) {
  seed()
}

module.exports = seed
