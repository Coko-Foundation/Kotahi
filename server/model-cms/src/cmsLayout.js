const { BaseModel } = require('@coko/server')

class CMSLayout extends BaseModel {
  static get tableName() {
    return 'cms_layouts'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const File = require('@coko/server/src/models/file/file.model')
    return {
      logo: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'cms_layouts.logoId',
          to: 'files.id',
        },
      },
    }
  }

  static get schema() {
    const arrayOfStoredPartners = {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          url: { type: 'string' },
          sequenceIndex: { type: ['integer', 'null'] },
        },
      },
    }

    return {
      properties: {
        active: { type: ['boolean'] },
        isPrivate: { type: ['boolean'] },
        hexCode: { type: ['string', 'null'] },
        primaryColor: { type: 'string' },
        secondaryColor: { type: 'string' },
        logoId: { type: ['string', 'null'], format: 'uuid' },
        partners: arrayOfStoredPartners,
        footerText: { type: ['string', 'null'] },
        published: { type: ['string', 'object', 'null'], format: 'date-time' },
        edited: { type: ['string', 'object', 'null'], format: 'date-time' },
        groupId: { type: ['string'], format: 'uuid' },
      },
    }
  }
}

module.exports = CMSLayout
