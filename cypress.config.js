const { defineConfig } = require('cypress')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, './.env') })

const serverUrl = process.env.SERVER_URL
const e2eApiUrl = `${serverUrl}/api/e2e`
const restoreUrl = `${e2eApiUrl}/restore`
const seedUrl = `${e2eApiUrl}/seed`
const createTokenUrl = `${e2eApiUrl}/createToken`
const seedFormsUrl = `${e2eApiUrl}/seedForms`

module.exports = defineConfig({
  defaultCommandTimeout: 20000,
  viewportWidth: 1200,
  e2e: {
    baseUrl: 'http://localhost:4000',

    // 🛠 Correct place for on() and task handlers
    // setupNodeEvents(on, config) {
    //   on('task', {
    //     restore(name) {
    //       if (name === 'email_notification') {
    //         console.log('Restoring email_notification test data...')
    //         // Your custom logic here
    //         return null // or a promise, or true/false
    //       }

    //       return null
    //     },
    //   })

    //   return config
    // },
  },
  screenshotOnRunFailure: false,
  video: false,

  // custom config options
  restoreUrl,
  seedUrl,
  createTokenUrl,
  seedFormsUrl,
})
