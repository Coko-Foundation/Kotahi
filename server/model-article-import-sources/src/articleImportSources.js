const { BaseModel } = require('@coko/server')

class ArticleImportSources extends BaseModel {
  static get tableName() {
    return 'article_import_sources'
  }

  static get schema() {
    return {
      properties: {
        server: { type: ['string', 'null'] },
      },
    }
  }
}

ArticleImportSources.type = 'ArticleImportSources'
module.exports = ArticleImportSources
