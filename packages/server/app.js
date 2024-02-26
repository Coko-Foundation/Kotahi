const { logger, startServer } = require('@coko/server')
const yjsWebsocket = require('./server/yjsWebsocket/yjsWebsocket')

startServer()
  .then(() => {
    yjsWebsocket()
  })
  .catch(err => {
    logger.error('FATAL ERROR, SHUTTING DOWN:', err)
    process.exit(1)
  })
