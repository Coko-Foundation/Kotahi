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
}

module.exports = CoarNotification
