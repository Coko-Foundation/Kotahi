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
    // experimentalRunAllSpecs: true,
  },
  screenshotOnRunFailure: false,
  video: false,

  // custom config options
  restoreUrl,
  seedUrl,
  createTokenUrl,
  seedFormsUrl,
})
