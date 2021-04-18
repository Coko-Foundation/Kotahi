const BaseModel = require('@pubsweet/base-model')

class Form extends BaseModel {
  static get tableName() {
    return 'forms'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Form'
  }

  static get modifiers() {
    return {
      orderByCreated(builder) {
        builder.orderBy('created', 'desc')
      },
    }
  }

  static get schema() {
    return {
      properties: {
        purpose: { type: 'string' },
        structure: {
          type: 'object',
          properties: {
            name: { type: ['string', 'null'] },
            description: { type: ['string', 'null'] },
            haspopup: { type: 'bool' },
            popuptitle: { type: ['string', 'null'] },
            popupdescription: { type: ['string', 'null'] },
            children: {
              items: {
                type: 'object',
                properties: {
                  options: {
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        value: { type: 'string' },
                        id: { type: 'string', format: 'uuid' },
                      },
                    },
                    type: ['array', 'null'],
                  },
                  title: { type: ['string', 'null'] },
                  shortDescription: { type: ['string', 'null'] },
                  id: { type: 'string', format: 'uuid' },
                  component: { type: ['string', 'null'] },
                  name: { type: 'string' },
                  description: { type: ['string', 'null'] },
                  doiValidation: { type: ['string', 'null'] },
                  placeholder: { type: ['string', 'null'] },
                  parse: { type: ['string', 'null'] },
                  format: { type: ['string', 'null'] },
                  validate: {
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        value: { type: 'string' },
                        id: { type: 'string', format: 'uuid' },
                      },
                    },
                    type: ['array', 'null'],
                  },
                  validateValue: {
                    type: ['object', 'null'],
                    properties: {
                      minChars: { type: ['string', 'null'] },
                      maxChars: { type: ['string', 'null'] },
                      minSize: { type: ['string', 'null'] },
                    },
                  },
                },
              },
              type: 'array',
            },
          },
        },
      },
    }
  }
}

Form.type = 'Form'
module.exports = Form
