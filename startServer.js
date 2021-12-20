const { startServer } = require('@coko/server')

const seedForms = require('./scripts/seedForms')

const main = async () => {
  await seedForms()
  startServer()
}

main()
