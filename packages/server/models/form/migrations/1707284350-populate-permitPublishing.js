// Form fields have previously been populated with no value for `permitPublishing`.
// There should always be a value. This populates the value wherever it is missing,
// supplying either 'false', or, for a few specific fields, 'always'.
// If there is a pre-existing value, it is left unmodified.

/* eslint-disable no-param-reassign, no-restricted-syntax, no-await-in-loop, import/no-unresolved */
const { useTransaction } = require('@coko/server')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/extensions */
const Form = require('../models/form/form.model')

const fieldsToAlwaysPublishByDefault = [
  'submission.$title',
  'submission.$abstract',
  'submission.$authors',
  'submission.$doi',
]

exports.up = async knex => {
  return useTransaction(async trx => {
    const forms = await Form.query(trx)

    for (const form of forms) {
      form.structure.children = form.structure.children.map(field => {
        if (field.permitPublishing) return field
        return {
          ...field,
          permitPublishing: fieldsToAlwaysPublishByDefault.includes(field.name)
            ? 'always'
            : 'false',
        }
      })

      await Form.query().updateAndFetchById(form.id, form)
    }
  })
}
