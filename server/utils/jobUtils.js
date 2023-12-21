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

const getJobs = async (activeConfig, groupId) => {
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
          await importManuscripts(groupId, { user: null })
          await importManuscriptsFromSemanticScholar(groupId, {
            user: null,
          })
          await archiveOldManuscripts(groupId)
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
        tz: `${activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'}`,
        rule: `00 00 * * *`,
      },
      fn: async () => {
        // eslint-disable-next-line no-console
        console.info(
          `Running scheduler for tracking overdue tasks ${new Date().toISOString()}`,
        )

        try {
          await createNewTaskAlerts(groupId)
        } catch (error) {
          console.error(error)
        }
      },
    },
    // Job 3: Sending task email notifications
    {
      name: `Sending task email notifications - ${groupId}`,
      rule: {
        tz: `${activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'}`,
        rule: `00 00 * * *`,
      },
      fn: async () => {
        // eslint-disable-next-line no-console
        console.info(
          `Running scheduler for sending task email notifications ${new Date().toISOString()}`,
        )

        try {
          await sendAutomatedTaskEmailNotifications(groupId)
        } catch (error) {
          console.error(error)
        }
      },
    },
    // Job 4: Delete actioned entries from notification digest
    {
      name: `Delete actioned entries from notification digest - ${groupId}`,
      rule: {
        tz: `${activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'}`,
        rule: `0 0 * * *`,
      },
      fn: async () => {
        // eslint-disable-next-line no-console
        console.info(
          `Deleting actioned entries from notification digest ${new Date().toISOString()}`,
        )

        try {
          await deleteActionedEntries(groupId)
          await sendAutomatedNotifications(groupId)
        } catch (error) {
          console.error(error)
        }
      },
    },
    // Other new jobs..
  )

  return jobs
}

const sendAutomatedNotifications = async groupId => {
  try {
    const upcomingNotificationDigest = await models.NotificationDigest.query()
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
          await sendNotifications(groupId)
          await sendAutomatedNotifications(groupId)
        } catch (error) {
          console.error(error)
        }
      },
    )
  } catch (error) {
    console.error('Error scheduling job:', error)
  }
}

const initiateJobSchedules = async () => {
  const groups = await models.Group.query().where({ isArchived: false })

  await Promise.all(
    groups.map(async group => {
      const activeConfig = await models.Config.getCached(group.id)
      const jobs = await getJobs(activeConfig, group.id)

      // eslint-disable-next-line no-console
      console.info(`Schedule Jobs for group "${group.name}" - ${group.id}`)
      jobs.forEach(job => {
        const schedule = new ScheduleManager()
        schedule.start(job.name, job.rule, job.fn)
      })
      await sendAutomatedNotifications(group.id)
    }),
  )
}

module.exports = {
  getJobs,
  initiateJobSchedules,
  sendAutomatedNotifications,
}
