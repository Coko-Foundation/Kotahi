const { BaseModel } = require('@coko/server')

class PublishedArtifact extends BaseModel {
  static get tableName() {
    return 'published_artifacts'
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: 'string', format: 'uuid' },
        platform: { type: 'string' },
        externalId: { type: ['string', 'null'] },
        title: { type: ['string', 'null'] },
        content: { type: ['string', 'null'] },
        hostedInKotahi: { type: ['boolean', 'false'] },
        relatedDocumentUri: { type: ['string', 'null'] },
        relatedDocumentType: { type: ['string', 'null'] },
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable global-require */
    const { Manuscript } = require('@pubsweet/models')

    return {
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'publishedArtifacts.manuscriptId',
          to: 'manuscripts.id',
        },
      },
    }
  }
}

PublishedArtifact.type = 'PublishedArtifact'
module.exports = PublishedArtifact
