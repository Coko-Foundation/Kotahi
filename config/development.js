module.exports = {
  'pubsweet-server': {
    db: {
      database: 'kotahidev',
      user: 'kotahidev',
      password: 'kotahidev',
      host: 'localhost',
    },
    protocol: 'http',
    host: 'localhost',
    port: 3000,
    pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
    secret: 'secret-string',
  },
  'pubsweet-client': {
    protocol: 'http',
    host: 'localhost',
    port: 4000,
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
