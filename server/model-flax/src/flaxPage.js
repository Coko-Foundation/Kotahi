const { BaseModel } = require('@coko/server')

class FlaxPage extends BaseModel {
  static get tableName() {
    return 'flax_pages'
  }

  static get schema() {
    return {
      properties: {
        shortcode: { type: 'string' },
        title: { type: 'string' },
        content: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            header: { type: ['string', 'null'] },
            footer: { type: ['string', 'null'] },
          },
        },
      },
    }
  }
}

module.exports = FlaxPage
