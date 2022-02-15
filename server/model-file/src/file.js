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
    const { Manuscript, ReviewComment } = require('@pubsweet/models')

    return {
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'manuscripts.id',
          to: 'files.manuscript_id',
        },
      },
      reviewComment: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: ReviewComment,
        join: {
          from: 'review_comments.id',
          to: 'files.review_comments_id',
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
