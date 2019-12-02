const logger = require('@pubsweet/logger')
const { Journal, User } = require('@pubsweet/models')
const { createTables } = require('@pubsweet/db-manager')

const seed = async () => {
  await createTables(true)

  await new User({
    username: 'admin',
    password: 'password',
    email: 'admin@example.com',
    admin: true,
  }).save()

  await new User({
    username: 'john',
    email: 'john@example.com',
    password: 'johnjohn',
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
