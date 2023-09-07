const moment = require('moment-timezone')
const models = require('@pubsweet/models')
const Task = require('./task')
const TaskAlert = require('./taskAlert')
const TaskEmailNotification = require('./taskEmailNotification')
const taskConfigs = require('../../../config/journal/tasks.json')

const { createNewTaskAlerts, updateAlertsForTask } = require('./taskCommsUtils')
const TaskEmailNotificationLog = require('./taskEmailNotificationLog')

const resolvers = {
  Mutation: {
    updateTasks: async (_, { manuscriptId, groupId, tasks }) => {
      // Remove any tasks with repeated IDs; ensure manuscriptIds all match
      const distinctTasks = tasks
        .filter((task, i) => tasks.findIndex(t => t.id === task.id) === i)
        .map(task => ({
          ...task,
          manuscriptId,
          groupId,
        }))

      const currentTaskIdRecords = await Task.query()
        .select('id')
        .where({ manuscriptId, groupId })

      const idsToDelete = currentTaskIdRecords
        .filter(record => !distinctTasks.some(t => t.id === record.id))
        .map(record => record.id)

      return Task.transaction(async trx => {
        await Task.query(trx).delete().whereIn('id', idsToDelete)

        const promises = []

        for (let i = 0; i < distinctTasks.length; i += 1) {
          const task = {
            ...distinctTasks[i],
            manuscriptId,
            groupId,
            sequenceIndex: i,
          }

          promises.push(
            Task.query(trx)
              .insert(task)
              .onConflict('id')
              .merge()
              .returning('*')
              .withGraphFetched(
                '[assignee, notificationLogs, emailNotifications(orderByCreated).recipientUser]',
              ),
          )
        }

        const result = (await Promise.all(promises)).sort(
          (a, b) => a.sequenceIndex - b.sequenceIndex,
        )

        await Promise.all(result.map(task => updateAlertsForTask(task, trx)))
        return result
      })
    },
    updateTask: async (_, { task }) => {
      const currentCount = await Task.query()
        .where({ manuscriptId: task.manuscriptId, groupId: task.groupId })
        .resultSize()

      const existing = await Task.query().findById(task.id)

      // Ensure that we can't switch a task from one manuscript to another
      const manuscriptId = existing ? existing.manuscriptId : task.manuscriptId
      const sequenceIndex = existing ? existing.sequenceIndex : currentCount

      const taskRecord = {
        ...task,
        manuscriptId,
        groupId: task.groupId,
        sequenceIndex,
      }

      await Task.query().insert(taskRecord).onConflict('id').merge()

      await updateAlertsForTask(taskRecord)

      return Task.query()
        .findById(task.id)
        .withGraphFetched(
          '[assignee, emailNotifications(orderByCreated).recipientUser, notificationLogs]',
        )
    },

    updateTaskNotification: async (_, { taskNotification }) => {
      await TaskEmailNotification.query().upsertGraphAndFetch(
        taskNotification,
        { relate: true, insertMissing: true },
      )

      const associatedTask = await Task.query()
        .findById(taskNotification.taskId)
        .withGraphFetched(
          '[emailNotifications(orderByCreated).recipientUser, notificationLogs, assignee]',
        )

      return associatedTask
    },

    deleteTaskNotification: async (_, { id }, ctx) => {
      const taskEmailNotification = await TaskEmailNotification.query().findById(
        id,
      )

      const { taskId } = taskEmailNotification

      await TaskEmailNotification.query().deleteById(id)

      const associatedTask = await Task.query()
        .findById(taskId)
        .withGraphFetched(
          '[assignee, emailNotifications(orderByCreated).recipientUser, notificationLogs]',
        )

      return associatedTask
    },
    createNewTaskAlerts: async (_, { groupId }, ctx) =>
      createNewTaskAlerts(groupId), // For testing purposes. Normally initiated by a scheduler on the server.

    removeTaskAlertsForCurrentUser: async (_, __, ctx) =>
      TaskAlert.query().delete().where({ userId: ctx.user }),

    updateTaskStatus: async (_, { task }) => {
      // eslint-disable-next-line prefer-destructuring
      const status = taskConfigs.status

      const data = {
        status: task.status,
      }

      // get task
      const dbTask = await Task.query().findById(task.id)

      if (
        dbTask.status === status.NOT_STARTED &&
        task.status === status.IN_PROGRESS
      ) {
        const taskDurationDays = dbTask.defaultDurationDays

        const activeConfig = await models.Config.query().findOne({
          groupId: dbTask.groupId,
          active: true,
        })

        data.dueDate =
          taskDurationDays !== null
            ? moment()
                .tz(activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC')
                .endOf('day')
                .add(taskDurationDays, 'days')
            : null
      }

      const updatedTask = await Task.query()
        .patchAndFetchById(task.id, data)
        .withGraphFetched(
          '[assignee, notificationLogs, emailNotifications(orderByCreated).recipientUser]',
        )

      await updateAlertsForTask(updatedTask)

      return updatedTask
    },

    createTaskEmailNotificationLog: async (
      _,
      { taskEmailNotificationLog },
      ctx,
    ) => {
      await TaskEmailNotificationLog.query().insert(taskEmailNotificationLog)

      const associatedTask = await Task.query()
        .findById(taskEmailNotificationLog.taskId)
        .withGraphFetched(
          '[assignee, emailNotifications.recipientUser, notificationLogs]',
        )

      return associatedTask
    },
  },
  Query: {
    tasks: async (_, { manuscriptId, groupId }) => {
      return Task.query()
        .where({ manuscriptId, groupId })
        .orderBy('sequenceIndex')
        .withGraphFetched(
          '[assignee, notificationLogs, emailNotifications(orderByCreated).recipientUser]',
        )
    },
    userHasTaskAlerts: async (_, __, ctx) => {
      return (
        (await TaskAlert.query().where({ userId: ctx.user }).limit(1)).length >
        0
      )
    },
  },
  Task: {
    assignee: async parent => {
      return (
        parent.assignee || models.User.query().findById(parent.assigneeUserId)
      )
    },
    emailNotifications: async parent => {
      return (
        parent.emailNotifications ||
        Task.relatedQuery('emailNotifications')
          .for(parent.id)
          .orderBy('created', 'desc')
      )
    },
    notificationLogs: async parent => {
      return (
        parent.notificationLogs ||
        Task.relatedQuery('notificationLogs').for(parent.id).orderBy('created')
      )
    },
  },
  TaskEmailNotification: {
    recipientUser: async parent => {
      return (
        parent.recipientUser ||
        models.User.query().findById(parent.recipientUserId)
      )
    },
  },
}

const typeDefs = `
  input TaskInput {
    id: ID!
    manuscriptId: ID
    groupId: ID!
    title: String!
    assigneeUserId: ID
    defaultDurationDays: Int
    dueDate: DateTime
    reminderPeriodDays: Int
    status: String!
    emailNotifications: [TaskEmailNotificationInput]
    assigneeType: String
    assigneeName: String
    assigneeEmail: String
  }

  input UpdateTaskStatusInput {
    id: ID!
    status: String!
  }

  type Task {
    id: ID!
    created: DateTime!
    updated: DateTime
    manuscriptId: ID
    groupId: ID
    title: String!
    assigneeUserId: ID
    assignee: User
    defaultDurationDays: Int
    dueDate: DateTime
    reminderPeriodDays: Int
    sequenceIndex: Int!
    status: String!
    emailNotifications: [TaskEmailNotification]
    notificationLogs: [TaskEmailNotificationLog]
    assigneeType: String
    assigneeName: String
    assigneeEmail: String
  }

  type TaskAlert {
    taskId: ID
    assigneeUserId: ID
  }

  extend type Query {
    tasks(manuscriptId: ID, groupId: ID!): [Task!]!
    userHasTaskAlerts: Boolean!
  }

  input TaskEmailNotificationInput {
    id: ID!
    taskId: ID!
    recipientUserId: ID
    recipientType: String
    notificationElapsedDays: Int
    emailTemplateId: ID
    recipientName: String
    recipientEmail: String
    sentAt: DateTime
  }

  input TaskEmailNotificationLogInput {
    taskId: ID!
    senderEmail: String!
    recipientEmail: String!
    emailTemplateId: ID!
    content: String!
  }

  type TaskEmailNotificationLog {
    id: ID!
    taskId: ID!
    senderEmail: String!
    recipientEmail: String!
    emailTemplateId: ID!
    content: String!
    created: DateTime!
    updated: DateTime
  }

  type TaskEmailNotification {
    id: ID!
    taskId: ID!
    recipientUserId: ID
    recipientType: String
    notificationElapsedDays: Int
    emailTemplateId: ID
    recipientName: String
    recipientEmail: String
    created: DateTime!
    updated: DateTime
    recipientUser: User
    sentAt: DateTime
  }

  extend type Mutation {
    updateTasks(manuscriptId: ID, groupId: ID!, tasks: [TaskInput!]!): [Task!]!
    updateTask(task: TaskInput!): Task!
    createNewTaskAlerts(groupId: ID!): Boolean
    removeTaskAlertsForCurrentUser: Boolean
    updateTaskStatus(task: UpdateTaskStatusInput!): Task!
    updateTaskNotification(taskNotification: TaskEmailNotificationInput!): Task!
    deleteTaskNotification(id: ID!): Task!
    createTaskEmailNotificationLog(taskEmailNotificationLog: TaskEmailNotificationLogInput!): Task!
  }
`

module.exports = { typeDefs, resolvers }
