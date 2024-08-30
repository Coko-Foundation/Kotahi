// const path = require('path')

module.exports = {
  // db: {
  //   // temporary database name set by jest-environment-db
  //   // eslint-disable-next-line no-underscore-dangle
  //   database: global.__testDbName || 'test',
  // },
  pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
  port: 4000,
  secret: 'test',
  uploads: 'uploads',
  components: ['@pubsweet/model-user'],
}
