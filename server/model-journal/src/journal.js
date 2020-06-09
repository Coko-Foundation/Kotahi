const BaseModel = require('@pubsweet/base-model')
const { Team } = require('pubsweet-server')

class Journal extends BaseModel {
  static get tableName() {
    return 'journals'
  }

  constructor(properties) {
    super(properties)
    this.type = 'journal'
  }

  static get schema() {
    return {
      properties: {
        title: { type: ['string', 'null'] },
        manuscripts: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        meta: {
          type: 'object',
          properties: {
            publisherName: { type: ['string', 'null'] },
          },
        },
      },
    }
  }

  async $beforeDelete() {
    await Team.deleteAssociated(this.data.type, this.id)
  }
}

Journal.type = 'journal'
module.exports = Journal
