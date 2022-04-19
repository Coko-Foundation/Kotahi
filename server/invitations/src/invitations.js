const { BaseModel } = require('@coko/server')

class Invitation extends BaseModel {
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

Invitation.type = 'Invitation'
module.exports = Invitation
