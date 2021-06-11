const BaseModel = require('@pubsweet/base-model')

class ArticleImportHistory extends BaseModel {
  static get tableName() {
    return 'article_import_history'
  }

  static get schema() {
    return {
      properties: {
        date: { type: ['string', 'object', 'null'], format: 'date-time' },
        sourceId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

ArticleImportHistory.type = 'ArticleImportHistory'
module.exports = ArticleImportHistory
