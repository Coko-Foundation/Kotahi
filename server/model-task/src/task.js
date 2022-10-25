const { BaseModel } = require('@coko/server')

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

    return {
      assignee: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.assigneeUserId',
          to: 'users.id',
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
        isComplete: { type: 'boolean' },
        sequenceIndex: { type: 'integer' },
      },
    }
  }
}

Task.type = 'UserTask'

module.exports = Task
