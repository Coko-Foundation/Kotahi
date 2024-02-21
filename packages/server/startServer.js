const { startServer } = require('@coko/server')

const seedGroups = require('./scripts/seedGroups')

const main = async () => {
  await seedGroups()
  startServer()
}

main()
