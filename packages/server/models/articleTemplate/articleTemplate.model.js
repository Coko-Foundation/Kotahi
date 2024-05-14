const { BaseModel } = require('@coko/server')

class ArticleTemplate extends BaseModel {
  static get tableName() {
    return 'article_templates'
  }

  constructor(properties) {
    super(properties)
    this.type = 'ArticleTemplate'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const File = require('@coko/server/src/models/file/file.model')
    /* eslint-disable-next-line global-require */
    const Group = require('../group/group.model')

    return {
      files: {
        relation: BaseModel.HasManyRelation,
        modelClass: File,
        join: {
          from: 'article_templates.id',
          to: 'files.objectId',
        },
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'article_templates.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        name: { type: ['string', 'null'] },
        article: { type: ['string', 'null'] },
        css: { type: ['string', 'null'] },
        groupId: { type: ['string', 'null'], format: 'uuid' },
        isCms: { type: 'boolean' },
      },
    }
  }
}

ArticleTemplate.type = 'ArticleTemplate'

module.exports = ArticleTemplate
