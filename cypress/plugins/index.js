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

module.exports = (on, config) => {
  on('task', {
    'db:seed': () => seed(),
    dump: name => {
      if (process.env.NEWDUMPS) {
        return execSync(
          `pg_dump --column-inserts -d simplej > ${dumpFile(name)}`,
        )
      }
      return true
    },
    restore: name => seed(readFileSync(dumpFile(name), 'utf-8')),
  })
}
