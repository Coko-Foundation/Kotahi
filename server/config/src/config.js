const { BaseModel } = require('@coko/server')

class Config extends BaseModel {
  static get tableName() {
    return 'configs'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const Group = require('../../model-group/src/group')

    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'configs.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        active: { type: ['boolean', 'null'] },
        formData: {},
        groupId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

Config.type = 'Config'

module.exports = Config
