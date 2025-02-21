/* eslint-disable global-require */

// REFACTOR: REST

module.exports = {
  server: () => app => require('./inbox')(app),
}
