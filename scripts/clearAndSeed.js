const logger = require('@pubsweet/logger')
const { Journal, User } = require('@pubsweet/models')
const { createTables, db } = require('@pubsweet/db-manager')

const clearDb = async () => {
  const { rows } = await db.raw(`
    SELECT tablename, schemaname
    FROM pg_tables
    WHERE schemaname = 'public' OR schemaname = 'pgboss'
  `)

  if (rows.length) {
    logger.info('Overwriting existing database due to clobber option')
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
    return true
  }

  await createTables(true)

  await new User({
    username: 'admin',
    password: 'password',
    email: 'admin@example.com',
    admin: true,
  }).save()

  await new User({
    username: 'author',
    email: 'john@example.com',
    password: 'password',
  }).save()

  await new User({
    username: 'seditor',
    email: 'simone@example.com',
    password: 'password',
  }).save()

  await new User({
    username: 'heditor',
    email: 'hector@example.com',
    password: 'password',
  }).save()

  await new User({
    username: 'reviewer1',
    email: 'regina@example.com',
    password: 'password',
  }).save()

  await new User({
    username: 'reviewer2',
    email: 'robert@example.com',
    password: 'password',
  }).save()

  await new User({
    username: 'reviewer3',
    email: 'remionne@example.com',
    password: 'password',
  }).save()

  await new Journal({
    title: 'My Journal',
  }).save()

  logger.info('Seeding complete.')

  return true
}

if (require.main === module) {
  seed()
}

module.exports = seed
