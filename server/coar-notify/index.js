/* eslint-disable global-require */

module.exports = {
  server: () => app => require('./inbox')(app),
}
