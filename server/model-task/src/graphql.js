const Task = require('./task')
const { populateTemplatedTasksForManuscript } = require('./taskCommsUtils')

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

      return Task.transaction(async () => {
        await Task.query().delete().whereIn('id', idsToDelete)

        const promises = []

        for (let i = 0; i < distinctTasks.length; i += 1) {
          const task = { ...distinctTasks[i], manuscriptId, sequenceIndex: i }
          promises.push(
            Task.query()
              .insert(task)
              .onConflict('id')
              .merge()
              .returning('*')
              .withGraphFetched('assignee'),
          )
        }

        return (await Promise.all(promises)).sort(
          (a, b) => a.sequenceIndex - b.sequenceIndex,
        )
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

      return Task.query()
        .insert({ ...task, manuscriptId, sequenceIndex })
        .onConflict('id')
        .merge()
        .returning('*')
        .withGraphFetched('assignee')
    },
    populateTasksForManuscript: async (_, { manuscriptId }) =>
      populateTemplatedTasksForManuscript(manuscriptId),
  },
  Query: {
    tasks: async (_, { manuscriptId }) => {
      return Task.query()
        .where({ manuscriptId })
        .orderBy('sequenceIndex')
        .withGraphJoined('assignee')
    },
  },
}

const typeDefs = `
  input TaskInput {
    id: ID!
    manuscriptId: ID
    title: String!
    assigneeUserId: ID
    defaultDurationDays: Int
    dueDate: DateTime
    reminderPeriodDays: Int
    status: String!
    isComplete: Boolean!
  }

  type Task {
    id: ID!
    created: DateTime!
    updated: DateTime
    manuscriptId: ID
    title: String!
    assigneeUserId: ID
    assignee: User
    defaultDurationDays: Int
    dueDate: DateTime
    reminderPeriodDays: Int
    status: String!
    isComplete: Boolean!
  }

  extend type Query {
    tasks(manuscriptId: ID): [Task!]!
  }

  extend type Mutation {
    updateTasks(manuscriptId: ID, tasks: [TaskInput!]!): [Task!]!
    updateTask(task: TaskInput!): Task!
    populateTasksForManuscript(manuscriptId: ID!): [Task!]!
  }
`

module.exports = { typeDefs, resolvers }
