const { BaseModel } = require('@coko/server')

class Invitation extends BaseModel {
  static get tableName() {
    return 'invitations'
  }

  static get schema() {
    return {
      properties: {
        date: { type: ['string', 'object', 'null'], format: 'date-time' },
        manuscriptId: { type: ['string', 'null'], format: 'uuid' },
        purpose: { type: 'string' },
        toEmail: { type: ['string'] },
        status: { type: ['string'] },
        senderId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

Invitation.type = 'Invitation'
module.exports = Invitation
