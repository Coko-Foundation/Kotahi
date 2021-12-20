const { BaseModel } = require('@coko/server')

class TeamMember extends BaseModel {
  static get tableName() {
    return 'team_members'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { Alias, Team, User } = require('@pubsweet/models')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'team_members.userId',
          to: 'users.id',
        },
      },
      team: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Team,
        join: {
          from: 'team_members.teamId',
          to: 'teams.id',
        },
      },
      alias: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Alias,
        join: {
          from: 'team_members.aliasId',
          to: 'aliases.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        userId: { type: 'string', format: 'uuid' },
        teamId: { type: 'string', format: 'uuid' },
        aliasId: { type: ['string', 'null'], format: 'uuid' },
        status: { type: ['string', 'null'] },
        isShared: { type: ['boolean', 'null'] },
      },
    }
  }
}

module.exports = TeamMember
