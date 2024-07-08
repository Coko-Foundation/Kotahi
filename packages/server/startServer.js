const { startServer } = require('@coko/server')
const yjsWebsocket = require('./server/yjsWebsocket/yjsWebsocket')

const seedGroups = require('./scripts/seedGroups')

const main = async () => {
  await seedGroups()
  await startServer()

  yjsWebsocket()
}

main()
