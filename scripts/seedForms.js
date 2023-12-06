/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */

const { Form } = require('@pubsweet/models')

// TODO: come up with predefined generic forms based on workflows
const SUBMISSION_FORM_PATHS = {
  journal: '../app/storage/forms-journal/submit.json',
  prc: '../app/storage/forms-prc/submit.json',
  preprint1: '../app/storage/forms/submit.json',
  preprint2: '../app/storage/forms-preprint2/submit.json',
}

const REVIEW_FORM_PATH = '../app/storage/forms/review.json'
const DECISION_FORM_PATH = '../app/storage/forms/decison.json'

const tryAddForm = async (purpose, category, group, seedFilePath) => {
  const hasForm = !!(
    await Form.query().where({ purpose, category, groupId: group.id })
  ).length

  if (hasForm) {
    console.log(
      `    Form for ${category} already exists in database. Skipping.`,
    )
  } else {
    const formStructure = require(seedFilePath)

    const form = {
      purpose,
      structure: formStructure,
      category,
      groupId: group.id,
    }

    await Form.query().insert(form)
    console.log(
      `    Added ${category} form from ${seedFilePath} for "${group.name}" group to database.`,
    )
  }
}

const seed = async (group, config) => {
  await Promise.all([
    tryAddForm(
      'submit',
      'submission',
      group,
      SUBMISSION_FORM_PATHS[config.formData.instanceName],
    ),
    tryAddForm('review', 'review', group, REVIEW_FORM_PATH),
    tryAddForm('decision', 'decision', group, DECISION_FORM_PATH),
  ])
}

module.exports = seed
