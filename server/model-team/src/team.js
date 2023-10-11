const { BaseModel } = require('@coko/server')

class Team extends BaseModel {
  constructor(properties) {
    super(properties)

    this.type = 'team'
  }

  static get tableName() {
    return 'teams'
  }

  static get modifiers() {
    return {
      onlyAuthors(builder) {
        builder.where('role', 'author')
      },
      onlyEditors(builder) {
        builder.where('role', 'editor')
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { Alias, User, Manuscript } = require('@pubsweet/models')

    return {
      members: {
        relation: BaseModel.HasManyRelation,
        modelClass: require.resolve('./team_member'),
        join: {
          from: 'teams.id',
          to: 'team_members.teamId',
        },
      },
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'teams.id',
          through: {
            modelClass: require.resolve('./team_member'),
            from: 'team_members.teamId',
            to: 'team_members.userId',
          },
          to: 'users.id',
        },
      },
      aliases: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Alias,
        join: {
          from: 'teams.id',
          through: {
            modelClass: require.resolve('./team_member'),
            from: 'team_members.teamId',
            to: 'team_members.aliasId',
          },
          to: 'aliases.id',
        },
      },
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'teams.objectId',
          to: 'manuscripts.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        objectId: { type: ['string', 'null'], format: 'uuid' },
        objectType: { type: ['string', 'null'] },
        name: { type: 'string' },
        role: { type: ['string'] },
        owners: {
          type: ['array', 'null'],
          items: { type: 'string', format: 'uuid' },
        },
        global: { type: ['boolean', 'null'] },
      },
    }
  }
}

Team.type = 'team'

module.exports = Team
