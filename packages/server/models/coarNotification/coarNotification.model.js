const { BaseModel } = require('@coko/server')

class CoarNotification extends BaseModel {
  static get tableName() {
    return 'coar_notifications'
  }

  static get schema() {
    return {
      properties: {
        payload: { type: 'object' },
        manuscriptId: { type: 'string', format: 'uuid' },
        groupId: { type: 'string', format: 'uuid' },
        status: { type: 'boolean' },
      },
    }
  }

  static async getOfferNotificationForManuscript(manuscriptId) {
    const [offerNotification] = await this.query()
      .where({ manuscriptId })
      .andWhere(builder => {
        builder
          .whereRaw(`payload->>'type' = ?`, ['Offer']) // type is a string
          .orWhereRaw(`payload->'type' @> ?::jsonb`, ['["Offer"]']) // type is an array
      })

    return offerNotification
  }
}

module.exports = CoarNotification
