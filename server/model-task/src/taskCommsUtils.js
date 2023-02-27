const moment = require('moment-timezone')
const config = require('config')
const Task = require('./task')
const TaskAlert = require('./taskAlert')
const Team = require('../../model-team/src/team')
const TaskEmailNotificationLog = require('./taskEmailNotificationLog')
const taskConfigs = require('../../../config/journal/tasks.json')

const {
  sendEmailWithPreparedData,
} = require('../../model-user/src/userCommsUtils')

const {
  manuscriptIsActive,
  getEditorIdsForManuscript,
} = require('../../model-manuscript/src/manuscriptCommsUtils')

const TaskEmailNotification = require('./taskEmailNotification')

const populateTemplatedTasksForManuscript = async manuscriptId => {
  const newTasks = await Task.query()
    .whereNull('manuscriptId')
    .orderBy('sequenceIndex')
    .withGraphFetched('emailNotifications(orderByCreated)')

  const existingTasks = await Task.query()
    .where({ manuscriptId })
    .orderBy('sequenceIndex')

  const endOfToday = moment()
    .tz(config.manuscripts.teamTimezone || 'Etc/UTC')
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
        new Promise((resolve, reject) => {
          Task.query(trx)
            .insertAndFetch(task)
            .withGraphFetched('assignee')
            .then(taskObject => {
              Promise.all(
                taskObject.emailNotifications.map(emailNotification => {
                  const taskEmailNotification = {
                    ...emailNotification,
                    taskId: taskObject.id,
                  }

                  delete taskEmailNotification.id
                  return TaskEmailNotification.query(trx).insertAndFetch(
                    taskEmailNotification,
                  )
                }),
              )
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
    .filter(task => task.dueDate < now && task.status !== 'Done')
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
    task.status !== 'Done' &&
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
const createNewTaskAlerts = async () => {
  const startOfToday = moment()
    .tz(config.manuscripts.teamTimezone || 'Etc/UTC')
    .startOf('day')

  const startOfYesterday = moment(startOfToday).subtract(1, 'days')

  const overdueTasks = await Task.query()
    .where('dueDate', '<', startOfToday.toDate())
    .where('dueDate', '>=', startOfYesterday.toDate()) // Don't look earlier than yesterday, so we don't recreate alerts that are already dismissed.
    .whereNot({ status: 'Done' })

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

const getTaskEmailNotifications = async ({ status = null }) => {
  let taskQuery = Task.query() // no await here because it's a sub-query

  if (status) {
    taskQuery = taskQuery.where({ status })
  }

  return Task.relatedQuery('emailNotifications')
    .for(taskQuery)
    .withGraphFetched('task')
    .withGraphFetched('recipientUser')
    .withGraphFetched('task.assignee')
    .withGraphFetched('task.manuscript')
}

const sendAutomatedTaskEmailNotifications = async () => {
  const taskEmailNotifications = await getTaskEmailNotifications({
    status: taskConfigs.status.IN_PROGRESS,
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

    const { recipientTypes } = taskConfigs.emailNotifications
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
        const { assigneeTypes } = taskConfigs

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

          const ctx = {}
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
}

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
  await TaskEmailNotificationLog.query().insert(logData)

  const associatedTask = await Task.query()
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
