const BaseModel = require('@pubsweet/base-model')

class File extends BaseModel {
  static get tableName() {
    return 'files'
  }

  constructor(properties) {
    super(properties)
    this.type = 'file'
  }

  static get relationMappings() {
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
        url: { type: ['string', 'null'] },
        mimeType: { type: ['string', 'null'] },
        fileType: { type: ['string', 'null'] },
        filename: { type: ['string', 'null'] },
        size: { type: ['integer', 'null'] },
        reviewCommentId: { type: ['string', 'null'], format: 'uuid' },
        manuscriptId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

File.type = 'file'
module.exports = File
