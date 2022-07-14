const { BaseModel } = require('@coko/server')

class ThreadedDiscussion extends BaseModel {
  static get tableName() {
    return 'threaded_discussions'
  }

  static get modifiers() {
    return {
      orderByCreated(builder) {
        builder.orderBy('created', 'desc')
      },
    }
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: 'string', format: 'uuid' },
        threads: {},
      },
    }
  }
}

ThreadedDiscussion.type = 'ThreadedDiscussion'
module.exports = ThreadedDiscussion
