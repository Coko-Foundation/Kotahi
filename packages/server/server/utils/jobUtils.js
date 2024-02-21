const { useTransaction } = require('@coko/server')
const models = require('@pubsweet/models')
const ScheduleManager = require('./scheduleManager')

const {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
} = require('../model-manuscript/src/importManuscripts')

const {
  archiveOldManuscripts,
} = require('../model-manuscript/src/manuscriptCommsUtils')

const {
  createNewTaskAlerts,
  sendAutomatedTaskEmailNotifications,
} = require('../model-task/src/taskCommsUtils')

const {
  sendNotifications,
  deleteActionedEntries,
} = require('../model-notification/src/notificationCommsUtils')

const getJobs = async (activeConfig, groupId, options = {}) => {
  return useTransaction(
    async trx => {
      const jobs = []

      if (activeConfig.formData.manuscript.autoImportHourUtc) {
        // Job 1: Importing and archiving Manuscripts
        jobs.push({
          name: `Importing and archiving Manuscripts - ${groupId}`,
          rule: {
            tz: 'Etc/UTC',
            rule: `00 ${activeConfig.formData.manuscript.autoImportHourUtc} * * *`,
          },
          fn: async () => {
            // eslint-disable-next-line no-console
            console.info(
              `Running scheduler for importing and archiving Manuscripts at ${new Date().toISOString()}`,
            )

            try {
              await importManuscripts(groupId, { user: null }, { trx })
              await importManuscriptsFromSemanticScholar(
                groupId,
                {
                  user: null,
                },
                { trx },
              )
              await archiveOldManuscripts(groupId, { trx })
            } catch (error) {
              console.error(error)
            }
          },
        })
      }

      jobs.push(
        // Job 2: Tracking overdue tasks
        {
          name: `Tracking overdue tasks - ${groupId}`,
          rule: {
            tz: `${
              activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'
            }`,
            rule: `00 00 * * *`,
          },
          fn: async () => {
            // eslint-disable-next-line no-console
            console.info(
              `Running scheduler for tracking overdue tasks ${new Date().toISOString()}`,
            )

            try {
              await createNewTaskAlerts(groupId, { trx })
            } catch (error) {
              console.error(error)
            }
          },
        },
        // Job 3: Sending task email notifications
        {
          name: `Sending task email notifications - ${groupId}`,
          rule: {
            tz: `${
              activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'
            }`,
            rule: `00 00 * * *`,
          },
          fn: async () => {
            // eslint-disable-next-line no-console
            console.info(
              `Running scheduler for sending task email notifications ${new Date().toISOString()}`,
            )

            try {
              await sendAutomatedTaskEmailNotifications(groupId, { trx })
            } catch (error) {
              console.error(error)
            }
          },
        },
        // Job 4: Delete actioned entries from notification digest
        {
          name: `Delete actioned entries from notification digest - ${groupId}`,
          rule: {
            tz: `${
              activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'
            }`,
            rule: `0 0 * * *`,
          },
          fn: async () => {
            // eslint-disable-next-line no-console
            console.info(
              `Deleting actioned entries from notification digest ${new Date().toISOString()}`,
            )

            try {
              await deleteActionedEntries(groupId, { trx })
              await sendAutomatedNotifications(groupId, { trx })
            } catch (error) {
              console.error(error)
            }
          },
        },
        // Other new jobs..
      )

      return jobs
    },
    { trx: options.trx },
  )
}

const sendAutomatedNotifications = async (groupId, options = {}) => {
  return useTransaction(
    async trx => {
      try {
        const upcomingNotificationDigest =
          await models.NotificationDigest.query(trx)
            .select('maxNotificationTime')
            .from(
              models.NotificationDigest.query()
                .distinctOn(['userId', 'pathString'])
                .where({ groupId })
                .orderBy([
                  'userId',
                  'pathString',
                  { column: 'maxNotificationTime', order: 'asc' },
                ])
                .as('subquery'),
            )
            .where({ actioned: false })
            .orderBy('maxNotificationTime', 'asc')
            .first()

        const upcomingNotificationTime =
          upcomingNotificationDigest?.maxNotificationTime

        if (!upcomingNotificationTime) {
          // eslint-disable-next-line no-console
          console.info('No upcoming notifications found.')
          return
        }

        const currentDate = new Date()

        const notificationTime =
          upcomingNotificationTime <= currentDate
            ? new Date(currentDate.getTime() + 10000)
            : upcomingNotificationTime

        const schedule = new ScheduleManager()
        schedule.start(
          `Sending automated alerts - ${groupId}`,
          notificationTime,
          async () => {
            const disableSendNotificationsScheduler =
              process.env.DISABLE_EVENT_NOTIFICATIONS === 'true'

            if (disableSendNotificationsScheduler) {
              return
            }

            // eslint-disable-next-line no-console
            console.info(
              `Running scheduler to send notifications ${new Date().toISOString()}`,
            )

            try {
              await sendNotifications(groupId, { trx })
              await sendAutomatedNotifications(groupId, { trx })
            } catch (error) {
              console.error(error)
            }
          },
        )
      } catch (error) {
        console.error('Error scheduling job:', error)
      }
    },
    { trx: options.trx },
  )
}

const initiateJobSchedules = async () => {
  useTransaction(async trx => {
    const groups = await models.Group.query(trx).where({ isArchived: false })

    await Promise.all(
      groups.map(async group => {
        const activeConfig = await models.Config.getCached(group.id, { trx })
        const jobs = await getJobs(activeConfig, group.id, { trx })

        // eslint-disable-next-line no-console
        console.info(`Schedule Jobs for group "${group.name}" - ${group.id}`)

        jobs.forEach(job => {
          const schedule = new ScheduleManager()
          schedule.start(job.name, job.rule, job.fn)
        })

        await sendAutomatedNotifications(group.id, { trx })
      }),
    )
  })
}

module.exports = {
  getJobs,
  initiateJobSchedules,
  sendAutomatedNotifications,
}
