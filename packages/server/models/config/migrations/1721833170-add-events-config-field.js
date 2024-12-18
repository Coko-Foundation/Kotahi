const { useTransaction } = require('@coko/server')

const Config = require('../config.model')

const eventsSource = require('../../../services/notification/eventsSource')

exports.up = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          newConfig.formData.eventsConfig = Object.keys(eventsSource).reduce(
            (acc, key) => {
              acc[key] = { active: true }
              return acc
            },
            {},
          )

          await Config.query(trx).updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}

exports.down = async knex => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          delete newConfig.formData.eventsConfig

          await Config.query(trx).updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}
