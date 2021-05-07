const { startServer } = require('pubsweet-server')

const seedForms = require('./scripts/seedForms')(async () => {
  await seedForms()
  startServer()
})()
