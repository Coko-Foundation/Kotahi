const { BaseModel } = require('@coko/server')
const TaskEmailNotificationLog = require('./taskEmailNotificationLog')

class Task extends BaseModel {
  static get tableName() {
    return 'tasks'
  }

  static get modifiers() {
    return {
      orderBySequence(builder) {
        builder.orderBy('sequenceIndex')
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { User } = require('@pubsweet/models')
    /* eslint-disable-next-line global-require */
    const TaskEmailNotification = require('./taskEmailNotification')
    /* eslint-disable-next-line global-require */
    const Manuscript = require('../../model-manuscript/src/manuscript')

    return {
      assignee: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.assigneeUserId',
          to: 'users.id',
        },
      },
      emailNotifications: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaskEmailNotification,
        join: {
          from: 'tasks.id',
          to: 'task_email_notifications.taskId',
        },
      },
      notificationLogs: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaskEmailNotificationLog,
        join: {
          from: 'tasks.id',
          to: 'task_email_notifications_logs.taskId',
        },
      },
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'tasks.manuscriptId',
          to: 'manuscripts.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: ['string', 'null'], format: 'uuid' },
        title: { type: 'string' },
        assigneeUserId: { type: ['string', 'null'], format: 'uuid' },
        defaultDurationDays: { type: ['integer', 'null'] },
        dueDate: { type: ['string', 'object', 'null'], format: 'date-time' },
        reminderPeriodDays: { type: ['integer', 'null'] },
        status: { type: 'string' },
        sequenceIndex: { type: 'integer' },
        assigneeType: { type: ['string', 'null'] },
        assigneeName: { type: ['string', 'null'] },
        assigneeEmail: { type: ['string', 'null'] },
      },
    }
  }
}

Task.type = 'UserTask'

module.exports = Task
