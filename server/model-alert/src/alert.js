const { BaseModel } = require('@coko/server')

class Alert extends BaseModel {
  static get tableName() {
    return 'alerts'
  }

  static get schema() {
    return {
      properties: {
        title: { type: 'string' },
        userId: { type: ['string', 'null'], format: 'uuid' },
        messageId: { type: ['string', 'null'], format: 'uuid' },
        triggerTime: {
          type: ['string', 'object', 'null'],
          format: 'date-time',
        },
        isSent: { type: 'boolean', default: false },
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { User } = require('@pubsweet/models')
    /* eslint-disable-next-line global-require */
    const Message = require('../../model-message/src/message')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'alerts.userId',
          to: 'users.id',
        },
      },
      message: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Message,
        join: {
          from: 'alerts.messageId',
          to: 'messages.id',
        },
      },
    }
  }
}

Alert.type = 'Alert'
module.exports = Alert
