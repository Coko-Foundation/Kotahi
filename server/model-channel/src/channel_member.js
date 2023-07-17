const { BaseModel } = require('@coko/server')

class ChannelMember extends BaseModel {
  static get tableName() {
    return 'channel_members'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { Channel, User } = require('@pubsweet/models')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'channel_members.userId',
          to: 'users.id',
        },
      },
      channel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: 'channel_members.channelId',
          to: 'channels.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        userId: { type: 'string', format: 'uuid' },
        channelId: { type: 'string', format: 'uuid' },
        lastViewed: {
          type: ['string', 'object', 'null'],
          format: 'date-time',
        },
        lastAlertTriggeredTime: {
          type: ['string', 'object', 'null'],
          format: 'date-time',
        },
      },
    }
  }
}

module.exports = ChannelMember
