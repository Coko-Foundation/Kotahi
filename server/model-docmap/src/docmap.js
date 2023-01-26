const { BaseModel } = require('@coko/server')

class Docmap extends BaseModel {
  static get tableName() {
    return 'docmaps'
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: 'string', format: 'uuid' },
        externalId: { type: 'string' },
        content: { type: 'string' },
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const { Manuscript } = require('@pubsweet/models')

    return {
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'docmaps.manuscriptId',
          to: 'manuscripts.id',
        },
      },
    }
  }
}

Docmap.type = 'Docmap'
module.exports = Docmap
