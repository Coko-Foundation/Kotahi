/* eslint-disable no-param-reassign */
const {
  useTransaction,
  // logger
} = require('@coko/server')

const { map } = require('lodash')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Form = require('../models/form/form.model')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const forms = await Form.query(trx).where({
        purpose: 'submit',
        category: 'submission',
      })

      // logger.info(`Total submission forms: ${forms.length}`)

      // let updatedForms = 0

      return Promise.all(
        forms.map(async form => {
          map(form.structure.children, children => {
            children.hideFromReviewers = 'false'

            if (children.includeInReviewerPreview) {
              delete children.includeInReviewerPreview
            }
          })
          await Form.query().patchAndFetchById(form.id, form)
          // updatedForms += 1
        }),
      )
      // .then(res => {
      //   logger.info(`Total updated submission forms: ${updatedForms}`)
      // })
    })
  } catch (error) {
    throw new Error(error)
  }
}
