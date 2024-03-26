const moment = require('moment-timezone')
const taskConfigs = require('../../../config/journal/tasks.json')

const Task = require('../../../models/task/task.model')
const TaskAlert = require('../../../models/taskAlert/taskAlert.model')
const TaskEmailNotification = require('../../../models/taskEmailNotification/taskEmailNotification.model')
const TaskEmailNotificationLog = require('../../../models/taskEmailNotificationLog/taskEmailNotificationLog.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const Team = require('../../../models/team/team.model')
const Config = require('../../../models/config/config.model')
const EmailTemplate = require('../../../models/emailTemplate/emailTemplate.model')

const {
  sendEmailWithPreparedData,
} = require('../../model-user/src/userCommsUtils')

const {
  manuscriptIsActive,
  getEditorIdsForManuscript,
  getIdOfLatestVersionOfManuscript,
} = require('../../model-manuscript/src/manuscriptCommsUtils')

const populateTemplatedTasksForManuscript = async manuscriptId => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .select('groupId')

  const activeConfig = await Config.getCached(manuscript.groupId)

  const newTasks = await Task.query()
    .whereNull('manuscriptId')
    .where({ groupId: manuscript.groupId })
    .orderBy('sequenceIndex')
    .withGraphFetched('emailNotifications(orderByCreated)')

  const existingTasks = await Task.query()
    .where({ manuscriptId, groupId: manuscript.groupId })
    .orderBy('sequenceIndex')

  const endOfToday = moment()
    .tz(activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC')
    .endOf('day')

  return Task.transaction(async trx => {
    const promises = []

    for (let i = 0; i < newTasks.length; i += 1) {
      const task = {
        ...newTasks[i],
        manuscriptId,
        dueDate: moment(endOfToday)
          .add(newTasks[i].defaultDurationDays, 'days')
          .toDate(),
        sequenceIndex: i + existingTasks.length,
      }

      delete task.id
      promises.push(
        /* eslint-disable-next-line no-loop-func */
        new Promise((resolve, reject) => {
          Task.query(trx)
            .insertAndFetch(task)
            .withGraphFetched('assignee')
            .then(taskObject => {
              const emailNotificationPromises = []

              // Start delay at 100ms per notification
              let delay = 0

              // eslint-disable-next-line no-restricted-syntax
              for (const emailNotification of taskObject.emailNotifications) {
                const taskEmailNotification = {
                  ...emailNotification,
                  taskId: taskObject.id,
                }

                delete taskEmailNotification.id

                // Increment the delay by 100ms per notification
                delay += 100

                const emailNotificationPromise = new Promise(
                  // eslint-disable-next-line no-loop-func, no-shadow
                  (resolve, reject) => {
                    setTimeout(() => {
                      TaskEmailNotification.query(trx)
                        .insertAndFetch(taskEmailNotification)
                        .then(result => resolve(result))
                        .catch(error => reject(error))
                    }, delay)
                  },
                )

                emailNotificationPromises.push(emailNotificationPromise)
              }

              Promise.all(emailNotificationPromises)
                .then(result => resolve(result))
                .catch(error => reject(error))
            })
        }),
      )
    }

    return existingTasks.concat(
      (await Promise.all(promises)).sort(
        (a, b) => a.sequenceIndex - b.sequenceIndex,
      ),
    )
  })
}

/** Adds alerts for overdue tasks for newly added team members;
 *  removes them for removed team members. */
const updateAlertsUponTeamUpdate = async (
  manuscriptId,
  userIdsToAdd,
  userIdsToRemove,
) => {
  if (!(await manuscriptIsActive(manuscriptId))) return
  const now = new Date()
  const tasks = await Task.query().where({ manuscriptId })

  const overdueTaskIds = tasks
    .filter(
      task =>
        task.dueDate && task.dueDate < now && task.status === 'In progress',
    )
    .map(task => task.id)

  await Promise.all(
    overdueTaskIds.map(async taskId => {
      const alertsToAdd = userIdsToAdd.map(userId => ({
        taskId,
        userId,
      }))

      await TaskAlert.query()
        .insert(alertsToAdd)
        .onConflict(['taskId', 'userId'])
        .ignore()

      await TaskAlert.query()
        .delete()
        .where({ taskId })
        .whereIn('userId', userIdsToRemove)
    }),
  )
}

/** Call this if a task is modified, to regenerate alerts where needed,
 * or remove existing alerts that have become redundant. */
const updateAlertsForTask = async (task, trx) => {
  if (!task.manuscriptId) return
  const isActive = await manuscriptIsActive(task.manuscriptId)

  const needsAlert =
    isActive &&
    task.status === 'In progress' &&
    task.dueDate &&
    new Date(task.dueDate).getTime() < Date.now()

  // TODO once we start creating alerts for assignees, we need to address that here.

  if (needsAlert) {
    const editorIds = await getEditorIdsForManuscript(task.manuscriptId)

    await TaskAlert.query(trx)
      .insert(editorIds.map(userId => ({ taskId: task.id, userId })))
      .onConflict(['taskId', 'userId'])
      .ignore()
  } else {
    await TaskAlert.query(trx).delete().where({ taskId: task.id })
  }
}

/** For all tasks that have gone overdue during the previous calendar day, create alerts as appropriate.
 * Don't look further than yesterday, to avoid regenerating alerts that have already been seen. */
const createNewTaskAlerts = async groupId => {
  const activeConfig = await Config.getCached(groupId)

  const startOfToday = moment()
    .tz(activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC')
    .startOf('day')

  const startOfYesterday = moment(startOfToday).subtract(1, 'days')

  const overdueTasks = await Task.query()
    .whereNotNull('dueDate')
    .where('dueDate', '<', startOfToday.toDate())
    .where('dueDate', '>=', startOfYesterday.toDate()) // Don't look earlier than yesterday, so we don't recreate alerts that are already dismissed.
    .where({ status: 'In progress', groupId })

  const manuscriptIds = [...new Set(overdueTasks.map(t => t.manuscriptId))]
  const manuscriptMap = {}
  await Promise.all(
    manuscriptIds.map(async manuscriptId => {
      const isActive = await manuscriptIsActive(manuscriptId)

      const editorIds = isActive
        ? await getEditorIdsForManuscript(manuscriptId)
        : []

      manuscriptMap[manuscriptId] = { editorIds, shouldSkip: !editorIds }
    }),
  )

  const alertsToInsert = []

  overdueTasks.forEach(task => {
    const manuscriptDetails = manuscriptMap[task.manuscriptId]
    if (manuscriptDetails.shouldSkip) return // I.e., continue

    /* TODO Re-enable once we start creating alerts for assignees
    if (task.assigneeUserId)
      alertsToInsert.push({ taskId: task.id, userId: task.assigneeUserId }) */
    manuscriptDetails.editorIds.forEach(editorId => {
      alertsToInsert.push({ taskId: task.id, userId: editorId })
    })
  })

  await TaskAlert.query()
    .insert(alertsToInsert)
    .onConflict(['taskId', 'userId'])
    .ignore()
}

const deleteAlertsForManuscript = async manuscriptId => {
  await TaskAlert.query()
    .delete()
    .whereIn('taskId', Task.query().select('id').where({ manuscriptId }))
}

const getTaskEmailNotifications = async (
  { status = null, groupId },
  options = {},
) => {
  const { trx } = options
  let taskQuery = Task.query(trx) // no await here because it's a sub-query

  if (status) {
    taskQuery = taskQuery.where({ status, groupId })
  }

  return Task.relatedQuery('emailNotifications')
    .for(taskQuery)
    .withGraphFetched('task')
    .withGraphFetched('recipientUser')
    .withGraphFetched('task.assignee')
    .withGraphFetched('task.manuscript')
}

const sendNotification = async n => {
  const { recipientTypes } = taskConfigs.emailNotifications
  const { assigneeTypes } = taskConfigs
  let notificationRecipients = []

  let recipientIsExternal = false

  switch (n.recipientType) {
    case recipientTypes.UNREGISTERED_USER:
      if (n.recipientEmail) {
        recipientIsExternal = true
        notificationRecipients = [
          {
            email: n.recipientEmail,
            name: n.recipientName,
          },
        ]
      }

      break

    case recipientTypes.REGISTERED_USER:
      if (n.recipientUser) {
        notificationRecipients = [
          {
            email: n.recipientUser.email,
            name: n.recipientUser.username,
          },
        ]
      }

      break

    case recipientTypes.EDITOR:
      notificationRecipients = await getTeamRecipients(n, [
        recipientTypes.EDITOR,
        recipientTypes.SENIOR_EDITOR,
        recipientTypes.HANDLING_EDITOR,
      ])
      break

    case recipientTypes.REVIEWER:
    case assigneeTypes.COLLABORATIVE_REVIEWER:
    case recipientTypes.AUTHOR:
      notificationRecipients = await getTeamRecipients(n, [n.recipientType])
      break

    case recipientTypes.ASSIGNEE:
      switch (n.task.assigneeType) {
        case assigneeTypes.UNREGISTERED_USER:
          if (n.task.assigneeEmail) {
            recipientIsExternal = true
            notificationRecipients = [
              {
                email: n.task.assigneeEmail,
                name: n.task.assigneeName,
              },
            ]
          }

          break

        case assigneeTypes.REGISTERED_USER:
          if (n.task.assignee) {
            notificationRecipients = [
              {
                email: n.task.assignee.email,
                name: n.task.assignee.username,
              },
            ]
          }

          break

        case assigneeTypes.EDITOR:
          notificationRecipients = await getTeamRecipients(n, [
            assigneeTypes.EDITOR,
            assigneeTypes.SENIOR_EDITOR,
            assigneeTypes.HANDLING_EDITOR,
          ])
          break

        case assigneeTypes.REVIEWER:
        case assigneeTypes.COLLABORATIVE_REVIEWER:
        case assigneeTypes.AUTHOR:
          notificationRecipients = await getTeamRecipients(n, [
            n.task.assigneeType,
          ])
          break
        default:
      }

      break
    default:
  }

  const { manuscript } = n.task

  // eslint-disable-next-line
  const editor = await manuscript.getManuscriptEditor()
  const currentUser = editor ? editor.username : ''

  // eslint-disable-next-line no-restricted-syntax
  for (const recipient of notificationRecipients) {
    let logData

    if (n.emailTemplateId) {
      try {
        let notificationInput = {
          manuscript,
          selectedTemplate: n.emailTemplateId,
          externalName: recipient.name, // New User username
          currentUser,
          groupId: n.task.groupId,
        }

        if (recipientIsExternal) {
          notificationInput = {
            ...notificationInput,
            externalEmail: recipient.email,
          }
        } else {
          notificationInput = {
            ...notificationInput,
            selectedEmail: recipient.email,
          }
        }

        const emailTemplateOption = n.emailTemplateId.replace(/([A-Z])/g, ' $1')

        // eslint-disable-next-line no-await-in-loop
        const emailTemplate = await EmailTemplate.query().findById(
          emailTemplateOption,
        )

        const messageBody = `${emailTemplate.emailContent.description} sent by Kotahi to ${recipient.name}`

        logData = {
          taskId: n.task.id,
          content: messageBody,
          emailTemplateKey: emailTemplateOption,
          emailTemplateId: emailTemplateOption,
          senderEmail: editor ? editor.email : '',
          recipientEmail: recipient.email,
        }

        const ctx = null
        // eslint-disable-next-line no-await-in-loop
        await sendEmailWithPreparedData(notificationInput, ctx, editor)
        // eslint-disable-next-line no-await-in-loop
        await logTaskEmailNotificationData(logData)
      } catch (error) {
        console.error(error)
      }
    }
  }
}

const sendAutomatedTaskEmailNotifications = async groupId => {
  const activeConfig = await Config.getCached(groupId)

  const startOfToday = moment()
    .tz(activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC')
    .startOf('day')

  const startOfTomorrow = moment(startOfToday).add(1, 'days')

  const taskEmailNotifications = await getTaskEmailNotifications({
    status: taskConfigs.status.IN_PROGRESS,
    groupId,
  })

  // eslint-disable-next-line no-restricted-syntax
  await Promise.all(
    taskEmailNotifications
      .filter(n => {
        if (n.sentAt || !n.task.dueDate) return false

        const dateOfNotification = moment(n.task.dueDate)
          .add(1, 'milliseconds') // Due date is usually 1 ms before midnight, so this pushes it to the following day.
          .add(n.notificationElapsedDays, 'days')

        return (
          dateOfNotification.isSameOrAfter(startOfToday) &&
          dateOfNotification.isBefore(startOfTomorrow)
        )
      })
      .map(n => sendNotification(n)),
  )
}

const getTeamRecipients = async (emailNotification, roles, options = {}) => {
  const { trx } = options

  // task notifications through scheduler are supposed to be sent only to team members from latest version of manuscript
  const latestManuscriptVersionId = await getIdOfLatestVersionOfManuscript(
    emailNotification.task.manuscriptId,
    { trx },
  )

  const teamQuery = Team.query(trx)
    .where({
      objectType: 'manuscript',
      objectId: latestManuscriptVersionId,
    })
    .whereIn('role', roles) // no await here because it's a sub-query

  const teamMembers = await Team.relatedQuery('members')
    .where(builder => {
      builder
        .whereNull('status')
        .orWhereNotIn('status', ['invited', 'rejected'])
    })
    .for(teamQuery)
    .withGraphFetched('user')

  return teamMembers.map(member => ({
    email: member.user.email,
    name: member.user.username,
  }))
}

const logTaskEmailNotificationData = async (logData, options = {}) => {
  const { trx } = options
  await TaskEmailNotificationLog.query(trx).insert(logData)

  const associatedTask = await Task.query(trx)
    .findById(logData.taskId)
    .withGraphFetched('[emailNotifications.recipientUser, notificationLogs]')

  return associatedTask
}

module.exports = {
  populateTemplatedTasksForManuscript,
  updateAlertsForTask,
  updateAlertsUponTeamUpdate,
  createNewTaskAlerts,
  deleteAlertsForManuscript,
  getTaskEmailNotifications,
  sendAutomatedTaskEmailNotifications,
}
