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
