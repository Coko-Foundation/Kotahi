const { BaseModel } = require('@coko/server')

class Channel extends BaseModel {
  static get tableName() {
    return 'channels'
  }

  static get relationMappings() {
    const {
      ChannelMember,
      User,
      Message,
      Manuscript,
      Group,
      /* eslint-disable-next-line global-require */
    } = require('@pubsweet/models')

    /* eslint-disable-next-line global-require */
    const Team = require('../../model-team/src/team')
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
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'channels.manuscriptId',
          to: 'manuscripts.id',
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
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'channels.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        type: { type: ['string', 'null'] },
        topic: { type: 'string' },
        teamId: { type: ['string', 'null'], format: 'uuid' },
        manuscriptId: { type: ['string', 'null'], format: 'uuid' },
        groupId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

module.exports = Channel
