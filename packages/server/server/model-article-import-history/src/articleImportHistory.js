const { BaseModel } = require('@coko/server')

class ArticleImportHistory extends BaseModel {
  static get tableName() {
    return 'article_import_history'
  }

  static get schema() {
    return {
      properties: {
        date: { type: ['string', 'object', 'null'], format: 'date-time' },
        sourceId: { type: ['string', 'null'], format: 'uuid' },
        groupId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

ArticleImportHistory.type = 'ArticleImportHistory'
module.exports = ArticleImportHistory
