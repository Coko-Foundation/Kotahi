const config = require('config')
const { app, clientUrl } = require('@coko/server')
const { setConfig } = require('./config/src/configObject')
const { registerPlugins } = require('./plugins/plugins')

// Last line of defence for unhandled promise rejections in the app. Promise rejections should always be handled!
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason)
})

setConfig({
  journal: config.journal,
  teams: config.teams,
  manuscripts: config.manuscripts,
  clientUrl,
}) // TODO pass all client config that does not come from `Config` table through this structure or append it to config resolver

const { initiateJobSchedules } = require('./utils/jobUtils')

registerPlugins()
initiateJobSchedules() // Initiate all job schedules

module.exports = app
