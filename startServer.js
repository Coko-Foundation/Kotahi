const { startServer } = require('pubsweet-server')

const seedForms = require('./scripts/seedForms')

const main = async () => {
  await seedForms()
  startServer()
}

main()
