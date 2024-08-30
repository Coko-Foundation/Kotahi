module.exports = {
  db: {
    database: 'kotahidev',
    user: 'kotahidev',
    password: 'kotahidev',
    host: 'localhost',
  },
  port: 3000,
  pool: { min: 0, max: 300, idleTimeoutMillis: 30000 },
  secret: 'secret-string',
  mailer: {
    from: 'simplej@example.com',
    path: `${__dirname}/test-mailer`, // eslint-disable-line node/no-path-concat
  },
}
