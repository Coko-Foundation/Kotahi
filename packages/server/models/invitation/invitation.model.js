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
        invitedPersonType: { type: ['string'] },
        invitedPersonName: { type: ['srting'] },
        responseDate: {
          type: ['string', 'object', 'null'],
          format: 'date-time',
        },
        responseComment: { type: ['string', 'null'] },
        declinedReason: { type: ['string', 'null'] },
        userId: { type: ['string', 'null'], format: 'uuid' },
        isShared: { type: ['boolean'] },
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const User = require('../user/user.model')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'invitations.userId',
          to: 'users.id',
        },
      },
    }
  }
}

Invitation.type = 'Invitation'
module.exports = Invitation
