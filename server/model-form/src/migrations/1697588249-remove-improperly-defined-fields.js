/* eslint-disable no-param-reassign */
const { useTransaction, logger } = require('@coko/server')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/no-unresolved */
const Form = require('../server/model-form/src/form')

exports.up = async knex => {
  return useTransaction(async trx => {
    let updatedFormsCount = 0
    const forms = await Form.query(trx)
    logger.info(`Total forms: ${forms.length}`)

    return Promise.all(
      forms.map(async form => {
        form.structure.children = form.structure.children.filter(
          field => !!field.component,
        )

        await Form.query(trx).patchAndFetchById(form.id, form)
        updatedFormsCount += 1
      }),
    ).then(res => {
      logger.info(`Total updated forms: ${updatedFormsCount}`)
    })
  })
}
