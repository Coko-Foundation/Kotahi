const graphql = require('./graphql')
const resolvers = require('./graphql')
const Task = require('./task')
const TaskAlert = require('./taskAlert')
const TaskEmailNotification = require('./taskEmailNotification')
const TaskEmailNotificationLog = require('./taskEmailNotificationLog')

module.exports = {
  models: [
    { model: Task, modelName: 'Task' },
    { model: TaskAlert, modelName: 'TaskAlert' },
    { model: TaskEmailNotification, modelName: 'TaskEmailNotification' },
    { model: TaskEmailNotificationLog, modelName: 'TaskEmailNotificationLog' },
  ],
  resolvers,
  ...graphql,
}
