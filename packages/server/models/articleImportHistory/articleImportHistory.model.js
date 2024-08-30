const { BaseModel } = require('@coko/server')

class ArticleImportHistory extends BaseModel {
  static get tableName() {
    return 'article_import_history'
  }

  static get schema() {
    return {
      properties: {
        date: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },
        sourceId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
        groupId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
      },
    }
  }
}

ArticleImportHistory.type = 'ArticleImportHistory'
module.exports = ArticleImportHistory
