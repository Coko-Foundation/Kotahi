const { BaseModel } = require('@coko/server')

class Config extends BaseModel {
  static get tableName() {
    return 'configs'
  }

  static get schema() {
    return {
      properties: {
        formData: {},
        active: { type: ['boolean', 'null'] },
      },
    }
  }
}

Config.type = 'Config'

module.exports = Config
