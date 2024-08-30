const { useTransaction, logger } = require('@coko/server')

const variableConfig = require('config')

const Config = require('../config.model')

const shouldRunDefaultImportsForColab = [true, 'true'].includes(
  variableConfig['import-for-prc'].default_import,
)

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    logger.info(`Existing Configs count: ${configs.length}`)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          if (
            newConfig.formData.instanceName === 'prc' &&
            shouldRunDefaultImportsForColab === true
          ) {
            let existingRecencyPeriodDays

            const publishingServers = [
              'arXiv',
              'bioRxiv',
              'ChemRxiv',
              'medRxiv',
              'research square',
            ]

            if (
              newConfig.formData.manuscript
                .semanticScholarImportsRecencyPeriodDays
            ) {
              existingRecencyPeriodDays =
                newConfig.formData.manuscript
                  .semanticScholarImportsRecencyPeriodDay

              newConfig.formData.manuscript.semanticScholarImportsRecencyPeriodDays =
                undefined
            }

            if (!newConfig.formData.semanticScholar) {
              newConfig.formData.semanticScholar = {}
            }

            newConfig.formData.semanticScholar.enableSemanticScholar = true
            newConfig.formData.semanticScholar.semanticScholarImportsRecencyPeriodDays =
              existingRecencyPeriodDays ?? 42
            newConfig.formData.semanticScholar.semanticScholarPublishingServers =
              publishingServers
          }

          await Config.query().updateAndFetchById(config.id, newConfig)
        }),
      )
    }

    logger.info(
      `Updated Semantic Scholar settings default value for prc instances.`,
    )
  })
}
