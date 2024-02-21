const { BaseModel } = require('@coko/server')

class Review extends BaseModel {
  static get tableName() {
    return 'reviews'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Review'
  }

  // async user() {
  //   const { User } = require('@pubsweet/models')
  //   return User.find(this.userId)
  // }

  // async getComments() {
  //   const File = require('../../model-file/src/file')

  //   await Promise.all(
  //     (this.comments || []).map(async comment => {
  //       const files = await File.query().where({
  //         objectType: 'Review',
  //         objectId: this.id,
  //       })
  //       const commentFile = files.find(file => file.fileType === comment.type)
  //       if (commentFile) {
  //         comment.files = [commentFile]
  //       }
  //       return comment
  //     }),
  //   )

  //   this.user = this.user()
  //   return this.comments
  // }
  static get relatedFindQueryMutates() {
    return false
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: 'string', format: 'uuid' },
        userId: { type: ['string', null], format: 'uuid' },
        user: { type: ['object', 'null'] },
        isDecision: { type: 'boolean' },
        isHiddenFromAuthor: { type: 'boolean' },
        isHiddenReviewerName: { type: 'boolean' },
        canBePublishedPublicly: { type: 'boolean' },
        jsonData: {},
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable global-require */
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
}

Review.type = 'Review'
module.exports = Review
