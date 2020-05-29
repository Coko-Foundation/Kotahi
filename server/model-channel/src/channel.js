const BaseModel = require('@pubsweet/base-model')

class Channel extends BaseModel {
  static get tableName() {
    return 'channels'
  }

  static get relationMappings() {
    const { ChannelMember, User, Message, Team } = require('@pubsweet/models')

    return {
      messages: {
        relation: BaseModel.HasManyRelation,
        modelClass: Message,
        join: {
          from: 'channels.id',
          to: 'messages.channelId',
        },
      },
      members: {
        relation: BaseModel.HasManyRelation,
        modelClass: ChannelMember,
        join: {
          from: 'channels.id',
          to: 'channel_members.channelId',
        },
      },
      team: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Team,
        join: {
          from: 'channels.teamId',
          to: 'teams.id',
        },
      },
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'channels.id',
          through: {
            modelClass: require.resolve('./channel_member'),
            from: 'channel_members.channelId',
            to: 'channel_members.userId',
          },
          to: 'users.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        name: { type: 'string' },
        type: { type: ['string', 'null'] },
        topic: { type: 'string' },
        teamId: { type: ['string', 'null'], format: 'uuid' },
        userId: { type: 'string' },
      },
    }
  }
}

module.exports = Channel
