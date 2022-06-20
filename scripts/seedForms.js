/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */

const { Form } = require('@pubsweet/models')

const SUBMISSION_FORM_PATHS = {
  aperture: '../app/storage/forms-aperture/submit.json',
  colab: '../app/storage/forms-colab/submit.json',
  elife: '../app/storage/forms/submit.json',
  ncrc: '../app/storage/forms-ncrc/submit.json',
}

const REVIEW_FORM_PATH = '../app/storage/forms/review.json'
const DECISION_FORM_PATH = '../app/storage/forms/decison.json'

const tryAddForm = async (purpose, category, seedFilePath) => {
  const hasForm = !!(await Form.query().where({ purpose, category })).length

  if (hasForm) {
    console.log(`  Form for ${category} already exists in database. Skipping.`)
  } else {
    const formStructure = require(seedFilePath)
    const form = { purpose, structure: formStructure, category }
    await Form.query().insert(form)
    console.log(`  Added ${category} form from ${seedFilePath} to database.`)
  }
}

const seed = async () => {
  await Promise.all([
    tryAddForm(
      'submit',
      'submission',
      SUBMISSION_FORM_PATHS[process.env.INSTANCE_NAME] ||
        SUBMISSION_FORM_PATHS.aperture, // In case of unknown instance name
    ),
    tryAddForm('review', 'review', REVIEW_FORM_PATH),
    tryAddForm('decision', 'decision', DECISION_FORM_PATH),
  ])
}

module.exports = seed
