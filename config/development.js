const { deferConfig } = require('config/defer')

module.exports = {
  'pubsweet-server': {
    baseUrl: deferConfig(
      cfg => `http://localhost:${cfg['pubsweet-server'].port}`,
    ),
    secret: 'secret-string',
  },
  dbManager: {
    username: 'admin',
    password: '12345678',
    email: 'admin@admin.com',
    admin: true,
  },
}
