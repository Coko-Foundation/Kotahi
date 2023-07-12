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
    return {
      properties: {
        active: { type: ['boolean'] },
        primaryColor: { type: 'string' },
        secondaryColor: { type: 'string' },
        logoId: { type: ['string', 'null'], format: 'uuid' },
        headerConfig: {},
      },
    }
  }
}

module.exports = CMSLayout
