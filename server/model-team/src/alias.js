const BaseModel = require('@pubsweet/base-model')

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
