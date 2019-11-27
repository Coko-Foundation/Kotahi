const { deferConfig } = require('config/defer')

module.exports = {
  'pubsweet-server': {
    db: {
      database: 'collabra',
    },
    baseUrl: deferConfig(
      cfg => `http://localhost:${cfg['pubsweet-server'].port}`,
    ),
    secret: 'secret-string',
  },
  'pubsweet-client': {
    baseUrl: 'http://localhost:4000/',
  },
  mailer: {
    from: 'simplej@simplej.com',
    path: `${__dirname}/test-mailer`,
  },
  dbManager: {
    username: 'admin',
    password: '12345678',
    email: 'admin@admin.com',
    admin: true,
  },
}
