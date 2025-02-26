/* eslint-disable global-require */

// Last line of defence for unhandled promise rejections in the app. Promise rejections should always be handled!
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason)
})

module.exports = [
  {
    label: 'Seed groups',
    execute: async () => {
      const seedGroups = require('../scripts/seedGroups')
      await seedGroups()
    },
  },
  {
    label: 'Set config',
    execute: async () => {
      const config = require('config')
      const { clientUrl } = require('@coko/server')
      const { setConfig } = require('../controllers/config/configObject')

      setConfig({
        journal: config.journal,
        teams: config.teams,
        manuscripts: config.manuscripts,
        clientUrl,
      }) // TODO pass all client config that does not come from `Config` table through this structure or append it to config resolver
    },
  },
  {
    label: 'Register plugins',
    execute: async () => {
      const { registerPlugins } = require('../server/plugins/plugins')
      registerPlugins()
    },
  },
  {
    label: 'Initiate job schedules',
    execute: async () => {
      const { initiateJobSchedules } = require('../server/utils/jobUtils')
      initiateJobSchedules() // Initiate all job schedules
    },
  },
  {
    label: 'Init yjs websocket',
    execute: () => {
      const yjsWebsocket = require('../server/yjsWebsocket/yjsWebsocket')
      yjsWebsocket()
    },
  },
]
