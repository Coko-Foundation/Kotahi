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

  static async getOfferNotificationForManuscript(manuscriptId, options = {}) {
    const { trx } = options

    const [offerNotification] = await this.query(trx)
      .where({ manuscriptId })
      .andWhere(builder => {
        builder
          .whereRaw(`payload->>'type' = ?`, ['Offer']) // type is a string
          .orWhereRaw(`payload->'type' @> ?::jsonb`, ['["Offer"]']) // type is an array
      })

    return offerNotification
  }

  static async getOfferNotificationForGroupByIdOrDoi(
    notificationId,
    groupId,
    doi,
    options = {},
  ) {
    const { trx } = options

    const [offerNotification] = await CoarNotification.query(trx)
      .where({ groupId })
      .andWhere(builder => {
        builder.whereRaw(`payload->>'id' = ?`, [notificationId])

        if (doi) {
          builder.orWhereRaw(`(payload->'object'->>'ietf:cite-as') ILIKE ?`, [
            `%${doi}%`,
          ])
        }
      })

    return offerNotification
  }
}

module.exports = CoarNotification
