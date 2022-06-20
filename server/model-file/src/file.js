/* Old file model to be removed once the object storage production deployment testing done! */
const { BaseModel } = require('@coko/server')

class File extends BaseModel {
  static get tableName() {
    return 'files_old'
  }

  constructor(properties) {
    super(properties)
    this.type = 'file'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { Manuscript, Review } = require('@pubsweet/models')

    return {
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'manuscripts.id',
          to: 'files.manuscript_id',
        },
      },
      review: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Review,
        join: {
          from: 'reviews.id',
          to: 'files.review_id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        label: { type: ['string', 'null'] },
        url: { type: ['string'] },
        mimeType: { type: ['string', 'null'] },
        fileType: { type: ['string'] },
        filename: { type: ['string'] },
        size: { type: ['integer'] },
        reviewCommentId: { type: ['string', 'null'], format: 'uuid' },
        manuscriptId: { type: ['string'], format: 'uuid' },
      },
    }
  }
}

File.type = 'file'
module.exports = File
