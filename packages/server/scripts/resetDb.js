/* eslint-disable no-await-in-loop, global-require */
/** Wait until the users table exists. I'm not sure this is needed, if we use await correctly
 * when running migrations or restoring from dump.
 */
const waitForDbToSettle = async () => {
  const User = require('../models/user/user.model')
  let ready

  while (!ready) {
    try {
      const users = await User.query()
      ready = !!users
    } catch (e) {
      console.error(e)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
/* eslint-enable no-await-in-loop, global-require */

/** Clears all objects from the public schema and reruns all the migrations. */
const resetDb = async () => {
  /* eslint-disable no-await-in-loop, global-require */
  const { logger, db } = require('@coko/server')
  const { migrate } = require('@pubsweet/db-manager')
  const seedGroups = require('./seedGroups')
  /* eslint-enable no-await-in-loop, global-require */

  logger.info('Resetting database')
  await db.raw('DROP SCHEMA IF EXISTS public CASCADE')
  await db.raw('CREATE SCHEMA public')
  logger.info("Dropped and recreated 'public' schema.")
  // console.log('before migrate command', process.cwd())
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
  /* eslint-disable-next-line no-await-in-loop, global-require */
  const { logger, db } = require('@coko/server')

  if (dumpSql) {
    await db.raw(dumpSql)
    logger.info(`Applied dump ${dumpName}`)
  }

  return true
}

/** Run the provided sql */
const resetDbAndApplyDump = async (dumpSql, dumpName) => {
  const reset = await resetDb()
  const dump = await applyDump(dumpSql, dumpName)

  return reset && dump
}

module.exports = { resetDb, applyDump, resetDbAndApplyDump }
