const { BaseModel } = require('@coko/server')

class PublishingCollection extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'publishingCollection'
  }

  static get tableName() {
    return 'publishing_collections'
  }

  static get schema() {
    return {
      properties: {
        manuscripts: {
          default: [],
          items: {
            type: 'string',
            format: 'uuid',
          },
          type: 'array',
        },
        active: { type: ['boolean', 'null'] },
        formData: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            publicationDate: { type: 'string' },
            image: { type: ['string', 'null'], format: 'uuid' },
            issueNumber: { type: 'string' },
          },
        },
        groupId: { type: 'string', format: 'uuid' },
      },
    }
  }
}

module.exports = PublishingCollection
