const { modelTypes, BaseModel } = require('@coko/server')

const { arrayOfObjectsNullable } = modelTypes

class CollaborativeDoc extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'CollaborativeDoc'
  }

  static get tableName() {
    return 'collaborative_docs'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const Group = require('../../model-group/src/group')

    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'collaborative_docs.group_id',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        objectId: { type: ['string'], format: 'uuid' },
        name: { type: ['string'] },
        groupId: { type: ['string'], format: 'uuid' },
        docs_prosemirror_delta: arrayOfObjectsNullable,
        docs_y_doc_state: {
          type: 'binary',
        },
      },
    }
  }
}

module.exports = CollaborativeDoc
