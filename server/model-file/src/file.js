const BaseModel = require('@pubsweet/base-model')
const logger = require('@pubsweet/logger')

class File extends BaseModel {
  static get tableName() {
    return 'files'
  }

  constructor(properties) {
    super(properties)
    this.type = 'file'
  }

  static get schema() {
    return {
      properties: {
        label: { type: ['string', 'null'] },
        url: { type: ['string', 'null'] },
        mimeType: { type: ['string', 'null'] },
        fileType: { type: ['string', 'null'] },
        filename: { type: ['string', 'null'] },
        size: { type: ['integer', 'null'] },
        object: { type: ['string', 'null'] },
        objectId: { type: 'string', format: 'uuid' },
      },
    }
  }

  static async findByObject({ object, object_id }) {
    logger.debug('Finding Files by Object')

    const results = await this.query()
      .where('object', object)
      .andWhere('object_id', object_id)

    return results
  }

  // async $beforeDelete() {
  //   await Team.deleteAssociated(this.data.type, this.id)
  // }
}

File.type = 'file'
module.exports = File
