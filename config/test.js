const { deferConfig } = require('config/defer')
const winston = require('winston')

module.exports = {
  'pubsweet-server': {
    db: {
      database: 'test',
    },
    ignoreTerminatedConnectionError: true,
    logger: new winston.Logger({
      level: 'warn',
      transports: [new winston.transports.Console()],
    }),
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
  'bad-pubsweet-component-ink-backend': {
    inkEndpoint: 'http://testinkdemo-api.coko.foundation/',
    email: 'test@example.com',
    password: 'p',
    recipes: {
      'editoria-typescript': '1',
    },
  },
}
