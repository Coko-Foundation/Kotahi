const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Config = require('../models/config/config.model')

// as requested here: https://gitlab.coko.foundation/kotahi/kotahi/-/merge_requests/1258#note_142075

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    logger.info(`Existing Configs count: ${configs.length}`)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          if (!newConfig.production) {
            newConfig.production = {}
          }

          if (!newConfig.production.citationStyles) {
            newConfig.production.citationStyles = {}
          }

          if (!newConfig.production.citationStyles.styleName) {
            newConfig.production.citationStyles.styleName =
              newConfig.production.styleName || 'apa'
          }

          if (!newConfig.production.citationStyles.localeName) {
            newConfig.production.citationStyles.localeName =
              newConfig.production.localeName || 'en-US'
          }

          await Config.query().updateAndFetchById(config.id, newConfig)
        }),
      )
    }

    logger.info(`Updated production config values for citation lookup.`)
  })
}
