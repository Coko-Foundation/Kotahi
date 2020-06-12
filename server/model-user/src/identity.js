const BaseModel = require('@pubsweet/base-model')

class Identity extends BaseModel {
  static get tableName() {
    return 'identities'
  }

  static get schema() {
    return {
      properties: {
        type: { type: 'string' },
        isDefault: { type: ['boolean', 'null'] },
        aff: { type: ['string', 'null'] },
        name: { type: ['string', 'null'] },
        identifier: { type: ['string', 'null'] },
        userId: { type: 'string', format: 'uuid' },
        oauth: {
          type: 'object',
          properties: {
            accessToken: { type: ['string'] },
            refreshToken: { type: ['string'] },
          },
        },
      },
    }
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: require('./user'),
        join: {
          from: 'identities.userId',
          to: 'users.id',
        },
      },
    }
  }
}

module.exports = Identity
