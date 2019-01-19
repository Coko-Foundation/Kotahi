const BaseModel = require('@pubsweet/base-model')
const { User } = require('pubsweet-server')
const File = require('../../file/src/file')

class Review extends BaseModel {
  static get tableName() {
    return 'reviews'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Review'
  }

  async user() {
    return User.find(this.userId)
  }

  async getComments() {
    await Promise.all(
      (this.comments || []).map(async comment => {
        const files = await File.findByObject({
          object: 'Review',
          object_id: this.id,
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

  async $beforeDelete() {
    const files = await File.findByObject({
      object_id: this.id,
      object: 'Review',
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
