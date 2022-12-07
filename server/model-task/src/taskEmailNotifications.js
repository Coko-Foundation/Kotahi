const { BaseModel } = require('@coko/server')

class TaskEmailNotification extends BaseModel {
  static get tableName() {
    return 'task_email_notifications'
  }

  static get schema() {
    return {
      properties: {
        taskId: { type: 'string', format: 'uuid' },
        recipientUserId: { type: ['string', 'null'], format: 'uuid' },
        isRecipientAssignee: { type: ['bool', 'null'] },
        recipientRole: { type: ['string', 'null'] },
        notificationElapsedDays: { type: ['integer', 'null'] },
        emailTemplateKey: { type: ['string', 'null'] },
      },
    }
  }
}

TaskEmailNotification.type = 'TaskEmailNotification'
module.exports = TaskEmailNotification
