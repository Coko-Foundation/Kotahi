const { BaseModel } = require('@coko/server')

class Invitations extends BaseModel {
  static get tableName() {
    return 'invitations'
  }

  static get schema() {
    return {
      properties: {
        date: { type: ['string', 'object', 'null'], format: 'date-time' },
        sourceId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

Invitations.type = 'Invitations'
module.exports = Invitations
