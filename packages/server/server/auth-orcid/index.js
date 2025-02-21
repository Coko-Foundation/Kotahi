const app = require('./orcid')

// REFACTOR: REST

module.exports = {
  server: () => app,
}
