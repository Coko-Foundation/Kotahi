const { BaseModel } = require('@coko/server')

class CMSFileTemplate extends BaseModel {
  static get tableName() {
    return 'cms_file_templates'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const File = require('@coko/server/src/models/file/file.model')
    return {
      file: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'cms_file_templates.fileId',
          to: 'files.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        name: { type: ['string', 'null'] },
        fileId: { type: ['string', 'null'], format: 'uuid' },
        parentId: { type: ['string', 'null'], format: 'uuid' },
        groupId: { type: ['string'], format: 'uuid' },
        rootFolder: { type: 'boolean' },
      },
    }
  }
}

module.exports = CMSFileTemplate
