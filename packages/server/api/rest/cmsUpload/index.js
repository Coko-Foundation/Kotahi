/* eslint-disable global-require */

module.exports = {
  server: () => app => require('./endpoint')(app),
}
