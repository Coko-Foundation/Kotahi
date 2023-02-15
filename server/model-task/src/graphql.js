const dateFns = require('date-fns')

const config = require('config')
const Task = require('./task')
const TaskAlert = require('./taskAlert')
const TaskEmailNotification = require('./taskEmailNotification')

const { createNewTaskAlerts, updateAlertsForTask } = require('./taskCommsUtils')

const resolvers = {
  Mutation: {
    updateTasks: async (_, { manuscriptId, tasks }) => {
      // Remove any tasks with repeated IDs; ensure manuscriptIds all match
      const distinctTasks = tasks
        .filter((task, i) => tasks.findIndex(t => t.id === task.id) === i)
        .map(task => ({
          ...task,
          dueDate: new Date(task.dueDate),
          manuscriptId,
        }))

      const currentTaskIdRecords = await Task.query()
        .select('id')
        .where({ manuscriptId })

      const idsToDelete = currentTaskIdRecords
        .filter(record => !distinctTasks.some(t => t.id === record.id))
        .map(record => record.id)

      return Task.transaction(async trx => {
        await Task.query(trx).delete().whereIn('id', idsToDelete)

        const promises = []

        for (let i = 0; i < distinctTasks.length; i += 1) {
          const task = { ...distinctTasks[i], manuscriptId, sequenceIndex: i }

          promises.push(
            Task.query(trx)
              .insert(task)
              .onConflict('id')
              .merge()
              .returning('*')
              .withGraphFetched('assignee'),
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
        .where({ manuscriptId: task.manuscriptId })
        .resultSize()

      const existing = await Task.query().findById(task.id)

      // Ensure that we can't switch a task from one manuscript to another
      const manuscriptId = existing ? existing.manuscriptId : task.manuscriptId
      const sequenceIndex = existing ? existing.sequenceIndex : currentCount
      const taskRecord = { ...task, manuscriptId, sequenceIndex }

      await updateAlertsForTask(taskRecord)

      await Task.query().insert(taskRecord).onConflict('id').merge()

      return Task.query()
        .findById(task.id)
        .withGraphFetched('assignee')
        .withGraphFetched('emailNotifications')
    },

    updateTaskNotification: async (_, { taskNotification }) => {
      const existingTaskEmailNotification = await TaskEmailNotification.query().where(
        { id: taskNotification.id },
      )

      if (existingTaskEmailNotification.length > 0) {
        await TaskEmailNotification.query()
          .update(taskNotification)
          .where({ id: taskNotification.id })
      } else {
        await TaskEmailNotification.query()
          .insert(taskNotification)
          .onConflict('id')
          .merge()
      }

      const associatedTask = await Task.query()
        .findById(taskNotification.taskId)
        .withGraphFetched('emailNotifications')

      return associatedTask
    },

    deleteTaskNotification: async (_, { id }, ctx) => {
      const taskEmailNotification = await TaskEmailNotification.query().findById(
        id,
      )

      const associatedTask = await Task.query()
        .findById(taskEmailNotification.taskId)
        .withGraphFetched('emailNotifications')

      await TaskEmailNotification.query().deleteById(id)

      return associatedTask
    },
    createNewTaskAlerts: async () => createNewTaskAlerts(), // For testing purposes. Normally initiated by a scheduler on the server.

    removeTaskAlertsForCurrentUser: async (_, __, ctx) =>
      TaskAlert.query().delete().where({ userId: ctx.user }),

    updateTaskStatus: async (_, { task }) => {
      // eslint-disable-next-line prefer-destructuring
      const status = config.tasks.status

      const data = {
        status: task.status,
      }

      // get task
      const dbTask = await Task.query().findById(task.id)

      if (dbTask.status === status.NOT_STARTED && task.status === status.IN_PROGRESS) {
        const taskDurationDays = dbTask.defaultDurationDays || 0
        data.dueDate = dateFns.addDays(new Date(), taskDurationDays)
      }

      await Task.query().update(data).where({ id: task.id })
      return Task.query().findById(task.id)
    },
  },
  Query: {
    tasks: async (_, { manuscriptId }) => {
      return Task.query()
        .where({ manuscriptId })
        .orderBy('sequenceIndex')
        .withGraphFetched('assignee')
        .withGraphFetched('emailNotifications')
    },
    userHasTaskAlerts: async (_, __, ctx) => {
      return (
        (await TaskAlert.query().where({ userId: ctx.user }).limit(1)).length >
        0
      )
    },
  },
}

const typeDefs = `
  input TaskInput {
    id: ID!
    manuscriptId: ID
    title: String!
    assigneeUserId: ID
    defaultDurationDays: String
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
    title: String!
    assigneeUserId: ID
    assignee: User
    defaultDurationDays: String
    dueDate: DateTime
    reminderPeriodDays: Int
    sequenceIndex: Int!
    status: String!
    emailNotifications: [TaskEmailNotification]
    assigneeType: String
    assigneeName: String
    assigneeEmail: String
  }

  type TaskAlert {
    taskId: ID
    assigneeUserId: ID
  }

  extend type Query {
    tasks(manuscriptId: ID): [Task!]!
    userHasTaskAlerts: Boolean!
  }

  input TaskEmailNotificationInput {
    id: ID!
    taskId: ID!
    recipientUserId: ID
    recipientType: String
    notificationElapsedDays: Int
    emailTemplateKey: String
    recipientName: String
    recipientEmail: String
  }

  type TaskEmailNotification {
    id: ID!
    taskId: ID!
    recipientUserId: ID
    recipientType: String
    notificationElapsedDays: Int
    emailTemplateKey: String
    recipientName: String
    recipientEmail: String
    created: DateTime!
    updated: DateTime
  }

  extend type Mutation {
    updateTasks(manuscriptId: ID, tasks: [TaskInput!]!): [Task!]!
    updateTask(task: TaskInput!): Task!
    createNewTaskAlerts: Boolean
    removeTaskAlertsForCurrentUser: Boolean
    updateTaskStatus(task: UpdateTaskStatusInput!): Task!
    updateTaskNotification(taskNotification: TaskEmailNotificationInput!): Task!
    deleteTaskNotification(id: ID!): Task!
  }
`

module.exports = { typeDefs, resolvers }
