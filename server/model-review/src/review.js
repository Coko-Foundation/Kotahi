const BaseModel = require('@pubsweet/base-model')

class Review extends BaseModel {
  static get tableName() {
    return 'reviews'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Review'
  }

  async user() {
    const { User } = require('@pubsweet/models')
    return User.find(this.userId)
  }

  async getComments() {
    const File = require('../../model-file/src/file')

    await Promise.all(
      (this.comments || []).map(async comment => {
        const files = await File.query().where({
          objectType: 'Review',
          objectId: this.id,
        })
        const commentFile = files.find(file => file.fileType === comment.type)
        if (commentFile) {
          comment.files = [commentFile]
        }
        return comment
      }),
    )

    this.user = this.user()
    return this.comments
  }

  static get schema() {
    return {
      properties: {
        recommendation: { type: ['string', 'null'] },
        manuscriptId: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        user: { type: ['object', 'null'] },
        isDecision: { type: ['boolean', 'false'] },
        comments: {
          type: ['array', 'null'],
        },
      },
    }
  }

  static get relationMappings() {
    const { Manuscript, User } = require('@pubsweet/models')

    return {
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'reviews.manuscriptId',
          to: 'manuscripts.id',
        },
      },
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reviews.userId',
          to: 'users.id',
        },
      },
    }
  }

  async $beforeDelete() {
    const File = require('../../model-file/src/file')
    const files = await File.query().where({
      objectId: this.id,
      objectType: 'Review',
    })
    if (files.length > 0) {
      files.forEach(async fl => {
        await new File(fl).delete()
      })
    }
  }
}

Review.type = 'Review'
module.exports = Review
