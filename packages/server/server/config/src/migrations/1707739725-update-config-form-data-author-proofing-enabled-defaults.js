/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Config = require('../server/config/src/config')

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    logger.info(`Existing Configs count: ${configs.length}`)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          newConfig.formData.controlPanel.authorProofingEnabled = false

          await Config.query().updateAndFetchById(config.id, newConfig)
        }),
      )
    }

    logger.info(
      `Updated authorProofingEnabled default value for all existing configs.`,
    )
  })
}
