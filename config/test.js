const { deferConfig } = require('config/defer')
const logger = require('winston')
const components = require('./components.json')

module.exports = {
  pubsweet: {
    components,
  },
  'pubsweet-server': {
    db: {
      database: 'test',
    },
    ignoreTerminatedConnectionError: true,
    logger,
    uploads: 'uploads',
    enableExperimentalGraphql: true,
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
