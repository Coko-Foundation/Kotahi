const { BaseModel } = require('@coko/server')

// model
class TaskEmailNotification extends BaseModel {
  static get tableName() {
    return 'task_email_notifications'
  }

  static get modifiers() {
    return {
      orderByCreated(builder) {
        builder.orderBy('created', 'asc')
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const User = require('../user/user.model')
    const Task = require('../task/task.model')
    const EmailTemplate = require('../emailTemplate/emailTemplate.model')
    /* eslint-enable global-require */

    return {
      recipientUser: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'task_email_notifications.recipientUserId',
          to: 'users.id',
        },
      },
      task: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'task_email_notifications.taskId',
          to: 'tasks.id',
        },
      },
      emailTemplate: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: EmailTemplate,
        join: {
          from: 'task_email_notifications.emailTemplateId',
          to: 'email_templates.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        taskId: { type: 'string', format: 'uuid' },
        recipientUserId: { type: ['string', 'null'], format: 'uuid' },
        recipientType: { type: ['string', 'null'] },
        notificationElapsedDays: { type: ['integer', 'null'] },
        emailTemplateKey: { type: ['string', 'null'] },
        emailTemplateId: { type: ['string', 'null'], format: 'uuid' },
        recipientName: { type: ['string', 'null'] },
        recipientEmail: { type: ['string', 'null'] },
        sentAt: { type: ['string', 'object', 'null'], format: 'date-time' },
      },
    }
  }
}

TaskEmailNotification.type = 'TaskEmailNotification'
module.exports = TaskEmailNotification
