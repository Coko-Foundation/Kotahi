/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Form = require('../server/model-form/src/form')
/* eslint-disable-next-line import/no-unresolved */
const Group = require('../server/model-group/src/group')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const forms = await Form.query(trx)
      const groups = await Group.query(trx)

      logger.info(`Existing Forms count: ${forms.length}`)
      logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1 && forms.length > 1 && !forms[0].group_id) {
        /* eslint no-param-reassign: "error" */
        await Form.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        logger.info('groupId patched successfully in form table')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
