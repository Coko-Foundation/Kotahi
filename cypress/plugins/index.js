// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const seed = require('../../scripts/clearAndSeed')

const { execSync } = require('child_process')
const path = require('path')
const { readFileSync } = require('fs')

const dumpFile = name => path.join(__dirname, '..', 'dumps', `${name}.sql`)

const testUsers = {
  'Sherry Crofoot': '0000000276459921',
  'Elaine Barnes': '0000000294294446',
  'Gale Davis': '0000000159567341',
  'Joanne Pilger': '0000000318382441',
  'Emily Clay': '0000000205642016',
  'Sinead Sullivan': '0000000256415729', // admin
}

module.exports = (on, config) => {
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
    restore: async name => seed(readFileSync(dumpFile(name), 'utf-8')),
    createToken: async name => {
      const { User } = require('@pubsweet/models')
      const authentication = require('pubsweet-server/src/authentication')
      const user = await User.query()
        .where({ username: testUsers[name] })
        .first()
      return authentication.token.create(user)
    },
  })
}
