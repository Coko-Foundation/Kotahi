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
        relation: BaseModel.ManyToManyRelation,
        modelClass: File,
        join: {
          from: 'review_comments.id',
          through: {
            from: 'fileables.review_comment_id',
            to: 'fileables.file_id',
          },
          to: 'files.id',
        },
      },
    }
  }

  async $beforeDelete() {
    // TODO: Do this with ON DELETE CASCADE?
    const File = require('../../model-file/src/file')
    const files = await File.query().where({
      objectId: this.id,
      objectType: 'ReviewComment',
    })
    if (files.length > 0) {
      files.forEach(async fl => {
        await new File(fl).delete()
      })
    }
  }
}

ReviewComment.type = 'Review'
module.exports = ReviewComment
