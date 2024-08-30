module.exports = {
  db: {
    database: 'kotahitest',
    user: 'kotahitest',
  },
  pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
  uploads: 'uploads',
  port: 3000,
  secret: 'secret-string',
  mailer: {
    from: 'simplej@example.com',
    path: `${__dirname}/test-mailer`, // eslint-disable-line node/no-path-concat
  },
}
