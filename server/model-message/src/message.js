const BaseModel = require('@pubsweet/base-model')

class Message extends BaseModel {
  static get tableName() {
    return 'messages'
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        channelId: { type: 'string' },
        content: { type: 'string' },
        userId: { type: 'string', format: 'uuid' },
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { User, Channel } = require('@pubsweet/models')

    return {
      channel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: 'messages.channelId',
          to: 'channels.id',
        },
      },
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'messages.userId',
          to: 'users.id',
        },
      },
    }
  }
}

module.exports = Message
