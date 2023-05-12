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
    pool: { min: 0, max: 300, idleTimeoutMillis: 30000 },
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
}
