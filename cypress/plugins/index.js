/* eslint-disable global-require */
/* eslint-disable no-console */
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
const { execSync } = require('child_process')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const { readFileSync } = require('fs')
const seed = require('../../scripts/clearAndSeed')

const seedForms = require('../../scripts/seedForms')

const dumpFile = name => path.join(__dirname, '..', 'dumps', `${name}.sql`)

// The values of this object are the usernames of the users
// TODO: Refactor DBs and Code dependent on testUsers object to use proper usernames than numbers
const testUsers = {
  'Sherry Crofoot': 'sherry921',
  'Elaine Barnes': 'elaine446',
  'Gale Davis': 'gale431',
  'Joane Pilger': 'joane441',
  'Emily Clay': 'emily016', // Author
  'Sinead Sullivan': 'sinead729', // Admin
  'Test Account': '000000032536230X',
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
    restore: async name => {
      // eslint-disable-next-line no-console
      console.log(name, 'name')
      return seed(readFileSync(dumpFile(name), 'utf-8'), { clear: true })
    },
    seed: async name => {
      console.log(name, 'name')
      // Restore without clear
      return seed(readFileSync(dumpFile(name), 'utf-8'), { clear: false })
    },
    createToken: async name => {
      const { User } = require('@pubsweet/models')

      const { createJWT } = require('@coko/server')

      const user = await User.query()
        .where({ username: testUsers[name] })
        .first()

      const jwt = createJWT(user)

      return jwt
    },
    seedForms: async () => {
      // eslint-disable-next-line no-console
      console.log('Seeding forms...')
      await seedForms()
      return null
    },
    log(message) {
      console.log(message)
      return null
    },
  })

  /**
   * We use specific userAgent value to simulate multiple resolutions, as well as simulate the Safari browser
   * Resolutions based on: iPhone 11, Samsung Galaxy A50, iPad Pro, Samsung Galaxy Tab S7+
   * @param {object} configOverride: in this constant we override the existing cypress config options
   * @param {object} configOverride.userAgent: if it's set to none, the default config values are taken
   */
  const configOverride = {}

  if (config.env.userAgent === 'tabletSafari') {
    configOverride.userAgent =
      'Mozilla/5.0 (iPad; CPU OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1'
    configOverride.viewportWidth = 2732
    configOverride.viewportHeight = 2048
  } else if (config.env.userAgent === 'tabletSamsung') {
    configOverride.userAgent =
      'Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-T970) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1.4.3'
    configOverride.viewportWidth = 1752
    configOverride.viewportHeight = 2800
  } else if (config.env.userAgent === 'phoneSamsung') {
    configOverride.userAgent =
      'Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-G980U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1.4.3'
    configOverride.viewportHeight = 2340
    configOverride.viewportWidth = 1080
  } else if (config.env.userAgent === 'phoneSafari') {
    configOverride.userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1'
    configOverride.viewportHeight = 1792
    configOverride.viewportWidth = 828
  } else if (config.env.userAgent === 'hdLaptop') {
    configOverride.userAgent = 'none'
    configOverride.viewportHeight = 768
    configOverride.viewportWidth = 1366
  } else {
    configOverride.userAgent = 'none'
  }

  return configOverride
}

