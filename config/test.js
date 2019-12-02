const { deferConfig } = require('config/defer')
const logger = require('winston')

module.exports = {
  'pubsweet-server': {
    db: {
      database: 'test',
    },
    pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
    ignoreTerminatedConnectionError: true,
    logger,
    uploads: 'uploads',
    port: 4000,
    secret: 'secret-string',
    baseUrl: deferConfig(
      cfg => `http://localhost:${cfg['pubsweet-server'].port}`,
    ),
  },
  'password-reset': deferConfig(
    cfg => `http://localhost:${cfg['pubsweet-server'].port}/password-reset`,
  ),
  mailer: {
    transport: {
      sendmail: false,
      port: 1025,
      auth: {
        user: 'user',
        pass: 'pass',
      },
    },
  },
}
