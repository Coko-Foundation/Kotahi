const { BaseModel } = require('@coko/server')

class TaskEmailNotificationLog extends BaseModel {
  static get tableName() {
    return 'task_email_notifications_logs'
  }

  static get modifiers() {
    return {
      orderByCreatedDesc(builder) {
        builder.orderBy('created', 'desc')
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const Task = require('./task')
    /* eslint-disable-next-line global-require */
    const EmailTemplate = require('../../model-email-templates/src/emailTemplate')

    return {
      task: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'task_email_notifications_logs.taskId',
          to: 'tasks.id',
        },
      },
      emailTemplate: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: EmailTemplate,
        join: {
          from: 'task_email_notifications_logs.emailTemplateId',
          to: 'email_templates.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        taskId: { type: 'string', format: 'uuid' },
        senderEmail: { type: 'string' },
        recipientEmail: { type: 'string' },
        emailTemplateKey: { type: 'string' },
        emailTemplateId: { type: ['string', 'null'], format: 'uuid' },
        content: { type: 'string' },
      },
    }
  }
}
TaskEmailNotificationLog.type = 'TaskEmailNotificationLog'
module.exports = TaskEmailNotificationLog
