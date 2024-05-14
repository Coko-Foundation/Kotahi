const { BaseModel } = require('@coko/server')

class EmailTemplate extends BaseModel {
  static get tableName() {
    return 'email_templates'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const TaskEmailNotification = require('../taskEmailNotification/taskEmailNotification.model')
    /* eslint-disable-next-line global-require */
    const TaskEmailNotificationLog = require('../taskEmailNotificationLog/taskEmailNotificationLog.model')

    return {
      taskEmailNotification: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaskEmailNotification,
        join: {
          from: 'email_templates.id',
          to: 'task_email_notifications.emailTemplateId',
        },
      },
      taskEmailNotificationLogs: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaskEmailNotificationLog,
        join: {
          from: 'email_templates.id',
          to: 'task_email_notifications_logs.emailTemplateId',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        emailContent: {
          type: 'object',
          properties: {
            cc: { type: ['string', 'null'] },
            subject: { type: ['string'] },
            body: { type: ['string'] },
            description: { type: ['string'] },
            ccEditors: { type: ['boolean'] },
          },
        },
        emailTemplateType: { type: ['string', 'null'] },
        emailTemplateKey: { type: ['string'] },
        groupId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

EmailTemplate.type = 'EmailTemplate'
module.exports = EmailTemplate
