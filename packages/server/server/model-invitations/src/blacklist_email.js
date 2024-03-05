const { BaseModel } = require('@coko/server')

class BlacklistEmail extends BaseModel {
  static get tableName() {
    return 'email_blacklist'
  }

  static get schema() {
    return {
      properties: {
        date: { type: ['string', 'object', 'null'], format: 'date-time' },
        email: { type: ['string'], format: 'email' },
        groupId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

BlacklistEmail.type = 'BlacklistEmail'
module.exports = BlacklistEmail
