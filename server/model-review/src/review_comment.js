const BaseModel = require('@pubsweet/base-model')

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
    const { File, Review, User } = require('@pubsweet/models')

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
          to: 'files.review_comment_id',
        },
      },
    }
  }
}

ReviewComment.type = 'Review'
module.exports = ReviewComment
