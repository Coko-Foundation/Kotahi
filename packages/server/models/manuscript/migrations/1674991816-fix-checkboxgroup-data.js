const { useTransaction, logger } = require('@coko/server')
const { isArray } = require('lodash')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Form = require('../models/form/form.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Manuscript = require('../models/manuscript/manuscript.model')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Review = require('../models/review/review.model')

const getCheckboxGroupFieldNames = async category => {
  const form = await Form.query().findOne({
    category,
    purpose: category === 'submission' ? 'submit' : category,
  })

  return form.structure.children
    .filter(f => f.component === 'CheckboxGroup')
    .map(f => f.name.replace('submission.', '')) // CheckboxGroup fields may reside in submission, review or decision objects, but not in other parts of manuscript such as meta.
}

/** Remove spurious 'on' strings from CheckboxGroup data */
const fixFields = (obj, fieldNames) => {
  let deletionCount = 0

  fieldNames.forEach(name => {
    if (isArray(obj[name])) {
      const initialOptionCount = obj[name].length
      // eslint-disable-next-line no-param-reassign
      obj[name] = obj[name].filter(item => item !== 'on')
      const finalOptionCount = obj[name].length
      deletionCount += initialOptionCount - finalOptionCount
    }
  })

  return deletionCount
}

const fixFieldsInAllObjects = async (
  objects,
  formDataName,
  formType,
  Model,
  trx,
) => {
  logger.info(`Total ${formType}s: ${objects.length}`)

  if (objects.length > 0) {
    const chkbxFieldNames = await getCheckboxGroupFieldNames(formType)
    let convertedCount = 0
    let totalDeletedOptionsCount = 0

    for (let i = 0; i < objects.length; i += 1) {
      const obj = objects[i]
      const formData = obj[formDataName]
      const deletedOptionsCount = fixFields(formData, chkbxFieldNames)
      obj[formDataName] = formData

      if (deletedOptionsCount) {
        logger.info(
          `${formType} ${
            obj.shortId || obj.id
          }: ${deletedOptionsCount} spurious selections deleted.`,
        )
        totalDeletedOptionsCount += deletedOptionsCount
        convertedCount += 1
      }

      // eslint-disable-next-line no-await-in-loop
      await Model.query(trx)
        .findById(obj.id)
        .patch({ [formDataName]: formData })
    }

    logger.info(
      `Deleted a total of ${totalDeletedOptionsCount} spurious selections from ${convertedCount} ${formType}s.`,
    )
  }
}

exports.up = async knex => {
  logger.info(
    'Deleting spurious CheckboxGroup selections from manuscript submissions, reviews and decisions:',
  )

  const manuscripts = await Manuscript.query()
  const reviewsAndDecisions = await Review.query()
  const reviews = reviewsAndDecisions.filter(r => !r.isDecision)
  const decisions = reviewsAndDecisions.filter(r => r.isDecision)

  return useTransaction(async trx => {
    await fixFieldsInAllObjects(
      manuscripts,
      'submission',
      'submission',
      Manuscript,
      trx,
    )
    await fixFieldsInAllObjects(reviews, 'jsonData', 'review', Review, trx)
    await fixFieldsInAllObjects(decisions, 'jsonData', 'decision', Review, trx)
  })
}
