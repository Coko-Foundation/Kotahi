const { BaseModel } = require('@coko/server')

// const INVALIDATE_CACHE_PERIOD_MS = 10000 // Refetch from DB if ten seconds have elapsed

class Config extends BaseModel {
  static get tableName() {
    return 'configs'
  }

  static cachedConfigsByGroupId = {}
  // static timeToInvalidateCache = 0

  /** Gets the active config for this groupId, retrieving from in-memory cache
   *  if available.
   */
  static async getCached(groupId) {
    // The following code can be uncommented to periodically invalidate the cache.
    // This would be necessary if multiple servers were accessing the same DB.

    // const now = Date.now()
    // if (now > this.timeToInvalidateCache) {
    //   this.cachedConfigsByGroupId = {}
    //   this.timeToInvalidateCache = now + INVALIDATE_CACHE_PERIOD_MS
    // }

    let config = this.cachedConfigsByGroupId[groupId]

    if (!config) {
      config = await this.query().findOne({ groupId, active: true })
      // Check again in case another task has set it in the meantime
      if (!this.cachedConfigsByGroupId[groupId])
        this.cachedConfigsByGroupId[groupId] = config
    }

    return config
  }

  static async beforeUpdate(opt, queryContext) {
    this.cachedConfigsByGroupId = {}
  }

  static async beforeDelete(queryContext) {
    this.cachedConfigsByGroupId = {}
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const Group = require('../../model-group/src/group')

    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'configs.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        active: { type: ['boolean', 'null'] },
        formData: {},
        groupId: { type: ['string', 'null'], format: 'uuid' },
      },
    }
  }
}

Config.type = 'Config'

module.exports = Config
