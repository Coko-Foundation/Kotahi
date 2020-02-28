const { deferConfig } = require('config/defer')

module.exports = {
  'pubsweet-server': {
    db: {
      database: 'simplej',
      user: 'test',
    },
    port: process.env.PORT || 3000,
    pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
    baseUrl: deferConfig(
      cfg => `http://localhost:${cfg['pubsweet-server'].port}`,
    ),
    secret: 'secret-string',
  },
  'pubsweet-client': {
    baseUrl: 'http://localhost:4000/',
  },
  mailer: {
    from: 'simplej@example.com',
    path: `${__dirname}/test-mailer`,
  },
  dbManager: {
    username: 'admin',
    password: '12345678',
    email: 'admin@admin.com',
    admin: true,
  },
}
