const { BaseModel } = require('@coko/server')

class ReviewComment extends BaseModel {
  static get tableName() {
    return 'review_comments'
  }

  constructor(properties) {
    super(properties)
    this.type = 'ReviewComment'
  }

  static get schema() {
    return {
      properties: {
        content: { type: ['string', 'null'] },
        userId: { type: 'string', format: 'uuid' },
        reviewId: { type: 'string', format: 'uuid' },
        commentType: { type: ['string', 'null'] },
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { Review, User } = require('@pubsweet/models')
    /* eslint-disable-next-line global-require */
    const File = require('@coko/server/src/models/file/file.model')

    return {
      review: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Review,
        join: {
          from: 'review_comments.reviewId',
          to: 'reviews.id',
        },
      },
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reviews_comments.userId',
          to: 'users.id',
        },
      },
      files: {
        relation: BaseModel.HasManyRelation,
        modelClass: File,
        join: {
          from: 'review_comments.id',
          to: 'files.objectId',
        },
      },
    }
  }
}

ReviewComment.type = 'Review'
module.exports = ReviewComment
