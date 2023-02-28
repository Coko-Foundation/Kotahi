const { BaseModel } = require('@coko/server')

class TaskEmailNotificationLog extends BaseModel {
  static get tableName() {
    return 'task_email_notifications_logs'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const Task = require('./task')
    return {
      task: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'task_email_notifications_logs.taskId',
          to: 'tasks.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        id: { type: 'string', format: 'uuid' },
        taskId: { type: 'string', format: 'uuid' },
        senderEmail: { type: 'string' },
        recipientEmail: { type: 'string' },
        emailTemplateKey: { type: 'string' },
        content: { type: 'string' },
        updated: { type: 'string', format: 'date-time' },
        created: { type: 'string', format: 'date-time' },
      },
    }
  }
}
TaskEmailNotificationLog.type = 'TaskEmailNotificationLog'
module.exports = TaskEmailNotificationLog
