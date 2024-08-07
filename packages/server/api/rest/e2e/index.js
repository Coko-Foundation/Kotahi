const endpoints = require('./endpoints')

module.exports = {
  server: () => app => endpoints(app),
}
