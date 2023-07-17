const config = require('config')
const { app } = require('@coko/server')
const { setConfig } = require('./config/src/configObject')

// You can modify the app or ensure other things are imported here.
const schedule = require('../node_modules/node-schedule')

setConfig({
  journal: config.journal,
  teams: config.teams,
  manuscripts: config.manuscripts,
  baseUrl: config['pubsweet-client'].baseUrl,
}) // TODO pass all client config that does not come from `Config` table through this structure or append it to config resolver

const {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
} = require('./model-manuscript/src/importManuscripts')

const {
  archiveOldManuscripts,
} = require('./model-manuscript/src/manuscriptCommsUtils')

const {
  createNewTaskAlerts,
  sendAutomatedTaskEmailNotifications,
} = require('./model-task/src/taskCommsUtils')

const Config = require('./config/src/config')
const { sendAlerts } = require('./model-alert/src/alertCommsUtils')

const {
  resetLastAlertTriggerTime,
} = require('./model-channel/src/channelCommsUtils')

const runSchedule = async () => {
  const activeConfig = await Config.query().first()

  if (activeConfig.formData.manuscript.autoImportHourUtc) {
    schedule.scheduleJob(
      {
        tz: 'Etc/UTC',
        rule: `00 ${activeConfig.formData.manuscript.autoImportHourUtc} * * *`,
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
      tz: `${activeConfig.formData.manuscript.teamTimezone || 'Etc/UTC'}`,
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
      tz: `${activeConfig.formData.manuscript.teamTimezone || 'Etc/UTC'}`,
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

  schedule.scheduleJob(
    {
      tz: `${activeConfig.formData.manuscript.teamTimezone || 'Etc/UTC'}`,
      rule: `* * * * *`,
    },
    async () => {
      const disableSendAlertsScheduler =
        process.env.DISABLE_EVENT_NOTIFICATIONS === 'true'

      if (disableSendAlertsScheduler) {
        return
      }

      // eslint-disable-next-line no-console
      console.info(
        `Running scheduler to send alerts ${new Date().toISOString()}`,
      )

      try {
        await sendAlerts()
      } catch (error) {
        console.error(error)
      }
    },
  )

  schedule.scheduleJob(
    {
      tz: `${activeConfig.formData.manuscript.teamTimezone || 'Etc/UTC'}`,
      rule: `0 0 * * *`,
    },
    async () => {
      // eslint-disable-next-line no-console
      console.info(
        `Resetting last alert trigger for all channel members ${new Date().toISOString()}`,
      )

      try {
        await resetLastAlertTriggerTime()
      } catch (error) {
        console.error(error)
      }
    },
  )
}

runSchedule()

module.exports = app
