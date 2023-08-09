const config = require('config')
const { app } = require('@coko/server')
const { setConfig } = require('./config/src/configObject')
const { registerPlugins } = require('./plugins/plugins')

setConfig({
  journal: config.journal,
  teams: config.teams,
  manuscripts: config.manuscripts,
  baseUrl: config['pubsweet-client'].baseUrl,
}) // TODO pass all client config that does not come from `Config` table through this structure or append it to config resolver

const { initiateJobSchedules } = require('./utils/jobUtils')

registerPlugins()
initiateJobSchedules() // Initiate all job schedules

module.exports = app
