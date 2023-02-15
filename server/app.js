const config = require('config')
const { app } = require('@coko/server')
const moment = require('moment')
const { setConfig } = require('./config/src/configObject')
const Team = require('./model-team/src/team')
const { sendEmailWithPreparedData } = require('./model-user/src/userCommsUtils')
const TaskEmailNotificationLog = require('./model-task/src/taskEmailNotificationLog')
const Task = require('./model-task/src/task')

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
  getTaskEmailNotifications,
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

    const taskEmailNotifications = await getTaskEmailNotifications({
      status: config.tasks.status.IN_PROGRESS,
    })

    // eslint-disable-next-line no-restricted-syntax
    for (const emailNotification of taskEmailNotifications) {
      const dateOfNotification = moment(emailNotification.task.dueDate).add(
        emailNotification.notificationElapsedDays,
        'days',
      )

      const today = moment()

      if (dateOfNotification.diff(today, 'days') !== 0) {
        // eslint-disable-next-line no-continue
        continue
      }

      if (emailNotification.sentAt) {
        // eslint-disable-next-line no-continue
        continue
      }

      const { recipientTypes } = config.tasks.emailNotifications
      let notificationRecipients = []

      switch (emailNotification.recipientType) {
        case recipientTypes.UNREGISTERED_USER:
          if (emailNotification.recipientEmail) {
            notificationRecipients = [
              {
                email: emailNotification.recipientEmail,
                name: emailNotification.recipientName,
              },
            ]
          }

          break

        case recipientTypes.REGISTERED_USER:
          if (emailNotification.recipientUser) {
            notificationRecipients = [
              {
                email: emailNotification.recipientUser.email,
                name: emailNotification.recipientUser.username,
              },
            ]
          }

          break

        case recipientTypes.EDITOR:
          // eslint-disable-next-line no-await-in-loop
          notificationRecipients = await getTeamRecipients(emailNotification, [
            recipientTypes.EDITOR,
            recipientTypes.SENIOR_EDITOR,
            recipientTypes.HANDLING_EDITOR,
          ])
          break

        case recipientTypes.REVIEWER:
        case recipientTypes.AUTHOR:
          // eslint-disable-next-line no-await-in-loop
          notificationRecipients = await getTeamRecipients(emailNotification, [
            emailNotification.recipientType,
          ])
          break

        case recipientTypes.ASSIGNEE:
          // eslint-disable-next-line no-case-declarations
          const { assigneeTypes } = config.tasks

          switch (emailNotification.task.assigneeType) {
            case assigneeTypes.UNREGISTERED_USER:
              if (emailNotification.task.assigneeEmail) {
                notificationRecipients = [
                  {
                    email: emailNotification.task.assigneeEmail,
                    name: emailNotification.task.assigneeName,
                  },
                ]
              }

              break

            case assigneeTypes.REGISTERED_USER:
              if (emailNotification.task.assignee) {
                notificationRecipients = [
                  {
                    email: emailNotification.task.assignee.email,
                    name: emailNotification.task.assignee.username,
                  },
                ]
              }

              break

            case assigneeTypes.EDITOR:
              // eslint-disable-next-line no-await-in-loop
              notificationRecipients = await getTeamRecipients(
                emailNotification,
                [
                  assigneeTypes.EDITOR,
                  assigneeTypes.SENIOR_EDITOR,
                  assigneeTypes.HANDLING_EDITOR,
                ],
              )
              break

            case assigneeTypes.REVIEWER:
            case assigneeTypes.AUTHOR:
              // eslint-disable-next-line no-await-in-loop
              notificationRecipients = await getTeamRecipients(
                emailNotification,
                [emailNotification.task.assigneeType],
              )
              break
            default:
          }

          break
        default:
      }

      const { manuscript } = emailNotification.task

      // eslint-disable-next-line no-await-in-loop
      const editor = await manuscript.getManuscriptEditor()
      const currentUser = editor ? editor.username : ''

      // eslint-disable-next-line no-restricted-syntax
      for (const recipient of notificationRecipients) {
        let logData

        if (emailNotification.emailTemplateKey) {
          try {
            // eslint-disable-next-line no-await-in-loop
            // const emailSender = currentUser

            const notificationInput = {
              manuscript,
              // selectedEmail: recipient.email, // selectedExistingRecieverEmail (TODO?): This is for a pre-existing receiver being selected
              selectedTemplate: emailNotification.emailTemplateKey,
              externalEmail: recipient.email,
              externalName: recipient.name, // New User username
              currentUser,
            }

            const emailTemplateOption = emailNotification.emailTemplateKey.replace(
              /([A-Z])/g,
              ' $1',
            )

            const selectedTemplateValue =
              emailTemplateOption.charAt(0).toUpperCase() +
              emailTemplateOption.slice(1)

            const messageBody = `${selectedTemplateValue} sent by Kotahi to ${recipient.name}`

            logData = {
              taskId: emailNotification.task.id,
              content: messageBody,
              emailTemplateKey: emailTemplateOption,
              senderEmail: editor.email,
              recipientEmail: recipient.email,
            }

            const ctx = ''
            // eslint-disable-next-line no-await-in-loop
            await sendEmailWithPreparedData(notificationInput, ctx, editor)
          } catch (error) {
            console.error(error)
          }

          // eslint-disable-next-line no-await-in-loop
          await logTaskEmailNotificationData(logData)
        }
      }
    }
  },
)

const getTeamRecipients = async (emailNotification, roles) => {
  const teamQuery = Team.query()
    .where({
      object_type: 'manuscript',
      object_id: emailNotification.task.manuscriptId,
    })
    .whereIn('role', roles) // no await here because it's a sub-query

  const teamMemberUsers = await Team.relatedQuery('users').for(teamQuery)
  return teamMemberUsers.map(user => ({
    email: user.email,
    name: user.username,
  }))
}

const logTaskEmailNotificationData = async logData => {
  await TaskEmailNotificationLog.query()
    .insert(logData)
    .onConflict('id')
    .merge()

  const associatedTask = await Task.query()
    .findById(logData.taskId)
    .withGraphFetched('emailNotifications.recipientUser')
    .withGraphFetched('notificationLogs')

  return associatedTask
}

module.exports = app
