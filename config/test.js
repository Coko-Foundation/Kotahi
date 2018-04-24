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
<<<<<<< HEAD
    secret: 'secret-string',
=======
    secret: 'test',
    baseUrl: deferConfig(
      cfg => `http://localhost:${cfg['pubsweet-server'].port}`,
    ),
>>>>>>> fix(test): fix test config
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
