const { BaseModel } = require('@coko/server')

class Alias extends BaseModel {
  static get tableName() {
    return 'aliases'
  }

  static get schema() {
    return {
      properties: {
        aff: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
    }
  }
}

module.exports = Alias
