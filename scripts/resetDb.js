const { logger, db } = require('@coko/server')
const { migrate } = require('@pubsweet/db-manager')
const seedGroups = require('./seedGroups')

/* eslint-disable no-await-in-loop, global-require */
/** Wait until the users table exists. I'm not sure this is needed, if we use await correctly
 * when running migrations or restoring from dump.
 */
const waitForDbToSettle = async () => {
  const { User } = require('@pubsweet/models')
  let ready

  while (!ready) {
    try {
      const users = await User.query()
      ready = !!users
    } catch (e) {
      console.error(e)
      await setTimeout(1000)
    }
  }
}
/* eslint-enable no-await-in-loop, global-require */

/** Clears all objects from the public schema and reruns all the migrations. */
const resetDb = async () => {
  logger.info('Resetting database')
  await db.raw('DROP SCHEMA public CASCADE')
  await db.raw('CREATE SCHEMA public')
  logger.info("Dropped and recreated 'public' schema.")
  await migrate({ logger })
  logger.info('Successfully ran all migrations.')

  // I'm not certain this is needed
  await db.raw(`set search_path to 'public';`)
  // I'm not certain this is needed
  await waitForDbToSettle()

  await seedGroups()

  return true
}

if (require.main === module) {
  resetDb()
}

const applyDump = async (dumpSql, dumpName = '') => {
  if (dumpSql) {
    await db.raw(dumpSql)
    logger.info(`Applied dump ${dumpName}`)
  }

  return true
}

/** Run the provided sql */
const resetDbAndApplyDump = async (dumpSql, dumpName) => {
  // eslint-disable-next-line no-return-await
  return (await resetDb()) && (await applyDump(dumpSql, dumpName))
}

module.exports = { resetDb, applyDump, resetDbAndApplyDump }
