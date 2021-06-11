const BaseModel = require('@pubsweet/base-model')

class Team extends BaseModel {
  constructor(properties) {
    super(properties)

    this.type = 'team'
  }

  static get tableName() {
    return 'teams'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { Alias, TeamMember, User, Manuscript } = require('@pubsweet/models')

    return {
      members: {
        relation: BaseModel.HasManyRelation,
        modelClass: TeamMember,
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
            modelClass: TeamMember,
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
          from: 'manuscripts.id',
          to: 'teams.manuscript_id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: ['string', 'null'], format: 'uuid' },
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
