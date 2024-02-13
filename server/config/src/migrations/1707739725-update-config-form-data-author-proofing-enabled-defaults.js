/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Config = require('../server/config/src/config')

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    logger.info(`Existing Configs count: ${configs.length}`)

    if (configs.length > 0) {
      configs.forEach(async config => {
        const newConfig = config

        newConfig.formData.controlPanel.authorProofingEnabled =
          newConfig.formData.instanceName === 'journal'

        await Config.query().updateAndFetchById(config.id, newConfig)
      })
    }

    logger.info(
      `Updated authorProofingEnabled default value for all existing configs.`,
    )
  })
}
