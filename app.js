const { logger, startServer } = require('@coko/server')

startServer().catch(err => {
  logger.error('FATAL ERROR, SHUTTING DOWN:', err)
  process.exit(1)
})
