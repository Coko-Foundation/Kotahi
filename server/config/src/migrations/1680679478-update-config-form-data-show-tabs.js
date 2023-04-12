/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Config = require('../server/config/src/config')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const configs = await Config.query(trx)

      logger.info(`Existing Configs count: ${configs.length}`)

      if (configs.length > 0) {
        configs.forEach(async config => {
          const newConfig = config

          if (newConfig.formData.controlPanel.showTabs.includes('Workflow')) {
            const showTabAdditions = ['Team', 'Decision']

            const filteredShowTabs = newConfig.formData.controlPanel.showTabs.filter(
              item => item !== 'Workflow',
            )

            newConfig.formData.controlPanel.showTabs = [].concat(
              showTabAdditions,
              filteredShowTabs,
            )

            await Config.query().updateAndFetchById(config.id, newConfig)
          }
        })
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
