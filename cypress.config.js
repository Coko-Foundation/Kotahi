const { defineConfig } = require('cypress')
const { execSync } = require('child_process')
const { readFileSync } = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, './.env') })

const { resetDbAndApplyDump, applyDump } = require('./scripts/resetDb')

const seedForms = require('./scripts/seedForms')

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
          return resetDbAndApplyDump(
            readFileSync(dumpFile(name), 'utf-8'),
            name,
          )
        },
        seed: async name => {
          // eslint-disable-next-line no-console
          console.log(name, 'name')
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
          // eslint-disable-next-line global-require
          const { User } = require('@pubsweet/models')

          // eslint-disable-next-line global-require
          const { createJWT } = require('@coko/server')

          const user = await User.query().where({ username }).first()

          if (!user) {
            const users = await User.query().select('username')
            throw new Error(
              `Could not find ${username} among users [${users
                .map(u => `'${u.username}'`)
                .join(', ')}]`,
            )
          }

          const jwt = createJWT(user)

          return jwt
        },
        seedForms: async () => {
          // eslint-disable-next-line global-require
          const { Group, Config } = require('@pubsweet/models')

          // eslint-disable-next-line no-console
          console.log('Seeding forms...')
          const group = await Group.query().findOne({ name: 'kotahi' })

          const activeConfig = await Config.query().findOne({
            groupId: group.id,
            active: true,
          })

          await seedForms(group, activeConfig)
          return null
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
})
