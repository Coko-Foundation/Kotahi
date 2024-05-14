const { defineConfig } = require('cypress')
const { execSync } = require('child_process')
const { readFileSync } = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, './.env') })

const dumpFile = name => path.join(__dirname, 'cypress', 'dumps', `${name}.sql`)

module.exports = defineConfig({
  defaultCommandTimeout: 20000,
  viewportWidth: 1200,
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        // 'db:seed': () => seed(),
        dump: name => {
          if (process.env.NEWDUMPS) {
            return execSync(
              `pg_dump --column-inserts -d simplej > ${dumpFile(name)}`,
            )
          }

          return true
        },
        restore: async name => {
          // eslint-disable-next-line no-console
          console.log(name, 'name')

          // Migrations paths in components.json are relative to packages/server, but cypress runs
          // in the project root folder. So we must change folder while migrations are run.
          const originalDirectory = process.cwd()

          if (!originalDirectory.endsWith('/packages/server')) {
            const targetDirectory = './packages/server'
            process.chdir(targetDirectory)
          }

          let result = false

          try {
            const {
              resetDbAndApplyDump,
            } = require('./packages/server/scripts/resetDb') /* eslint-disable-line global-require */

            result = await resetDbAndApplyDump(
              readFileSync(dumpFile(name), 'utf-8'),
              name,
            )
          } finally {
            process.chdir(originalDirectory)
          }

          // Wait long enough for server-side cache to clear
          /* eslint-disable-next-line no-promise-executor-return */
          await new Promise(resolve => setTimeout(resolve, 10500))
          return result
        },
        seed: async name => {
          // eslint-disable-next-line no-console
          console.log(name, 'name')

          /* eslint-disable-next-line global-require */
          const { applyDump } = require('./packages/server/scripts/resetDb')

          // Restore without clear
          return applyDump(
            readFileSync(dumpFile(name), 'utf-8'),
            {
              truncate: false,
            },
            name,
          )
        },
        createToken: async username => {
          /* eslint-disable-next-line global-require */
          const createToken = require('./packages/server/scripts/cypress/createToken')
          return createToken(username)
        },
        seedForms: async () => {
          /* eslint-disable-next-line global-require */
          const seedForms = require('./packages/server/scripts/cypress/seedForms')
          return seedForms()
        },
        log(message) {
          // eslint-disable-next-line no-console
          console.log(message)
          return null
        },
      })
      // important: return the changed config
    },
    baseUrl: 'http://localhost:4000',
  },
  screenshotOnRunFailure: false,
  video: false,
})
