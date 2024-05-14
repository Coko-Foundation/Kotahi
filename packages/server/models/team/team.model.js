const { BaseModel } = require('@coko/server')
const { evictFromCache } = require('../../server/querycache')

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
    /* eslint-disable global-require */
    const User = require('../user/user.model')
    const Alias = require('../alias/alias.model')
    /* eslint-enable global-require */

    return {
      members: {
        relation: BaseModel.HasManyRelation,
        modelClass: require.resolve('../teamMember/teamMember.model'),
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
            modelClass: require.resolve('../teamMember/teamMember.model'),
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
            modelClass: require.resolve('../teamMember/teamMember.model'),
            from: 'team_members.teamId',
            to: 'team_members.aliasId',
          },
          to: 'aliases.id',
        },
      },
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: require.resolve('../manuscript/manuscript.model'),
        join: {
          from: 'teams.objectId',
          to: 'manuscripts.id',
        },
      },
    }
  }

  // TODO add $beforeDelete once https://gitlab.coko.foundation/cokoapps/server/-/issues/43 is resolved
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    evictFromCache(`teamsForObject:${this.objectId}`)
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
