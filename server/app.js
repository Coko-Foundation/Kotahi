const config = require('config')
const { app } = require('@coko/server')
const { setConfig } = require('./config/src/configObject')

// You can modify the app or ensure other things are imported here.
const schedule = require('../node_modules/node-schedule')

setConfig({ teamTimezone: config.manuscripts.teamTimezone }) // TODO pass all client config through this structure

const {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
  archiveOldManuscripts,
} = require('./model-manuscript/src/manuscriptCommsUtils')

const {
  createNewTaskAlerts,
  sendAutomatedTaskEmailNotifications,
} = require('./model-task/src/taskCommsUtils')

if (config.manuscripts.autoImportHourUtc) {
  schedule.scheduleJob(
    {
      tz: 'Etc/UTC',
      rule: `00 ${config.manuscripts.autoImportHourUtc} * * *`,
    },
    async () => {
      // eslint-disable-next-line no-console
      console.info(
        `Running scheduler for importing and archiving Manuscripts at ${new Date().toISOString()}`,
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

schedule.scheduleJob(
  {
    tz: `${config.manuscripts.teamTimezone || 'Etc/UTC'}`,
    rule: `00 00 * * *`,
  },
  async () => {
    // eslint-disable-next-line no-console
    console.info(
      `Running scheduler for tracking overdue tasks ${new Date().toISOString()}`,
    )

    try {
      await createNewTaskAlerts()
    } catch (error) {
      console.error(error)
    }
  },
)

schedule.scheduleJob(
  {
    tz: `${config.manuscripts.teamTimezone || 'Etc/UTC'}`,
    rule: `00 00 * * *`,
  },
  async () => {
    // eslint-disable-next-line no-console
    console.info(
      `Running scheduler for sending task email notifications ${new Date().toISOString()}`,
    )

    try {
      await sendAutomatedTaskEmailNotifications()
    } catch (error) {
      console.error(error)
    }
  },
)

module.exports = app
