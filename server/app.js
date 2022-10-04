const config = require('config')

const { app } = require('@coko/server')

// You can modify the app or ensure other things are imported here.
const schedule = require('../node_modules/node-schedule')

const {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
  archiveOldManuscripts,
} = require('./model-manuscript/src/manuscriptCommsUtils')

if (config.manuscripts.autoImportHourUtc) {
  schedule.scheduleJob(
    {
      tz: 'Etc/UTC',
      rule: `00 ${config.manuscripts.autoImportHourUtc} * * *`,
    },
    async () => {
      // eslint-disable-next-line no-console
      console.info(
        `Running scheduled import and archive tasks at ${new Date().toISOString()}`,
      )

      try {
        await importManuscripts({ user: null })
        await importManuscriptsFromSemanticScholar({ user: null })
        await archiveOldManuscripts()
      } catch (error) {
        console.error(error)
      }
    },
  )
}

module.exports = app
