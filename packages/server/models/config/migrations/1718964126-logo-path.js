const { useTransaction } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Config = require('../models/config/config.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.find({}, { trx })

    await Promise.all(
      configs.result.map(async config => {
        const { logoPath } = config.formData.groupIdentity
        const prefix = '/assets'

        if (logoPath.startsWith(prefix)) {
          const newLogoPath = logoPath.slice(prefix.length)
          const modifiedConfig = { ...config }
          modifiedConfig.formData.groupIdentity.logoPath = newLogoPath
          await Config.patchAndFetchById(config.id, modifiedConfig, { trx })
        }
      }),
    )
  })
}
