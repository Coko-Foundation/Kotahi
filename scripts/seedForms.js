/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */

const { Form } = require('@pubsweet/models')

const formPaths = {
  aperture: '../app/storage/forms-aperture/submit.json',
  colab: '../app/storage/forms-colab/submit.json',
  elife: '../app/storage/forms/submit.json',
  ncrc: '../app/storage/forms-ncrc/submit.json',
  review: '../app/storage/forms/review.json',
  decision: '../app/storage/forms/decison.json',
}

const seed = async () => {
  const [{ count }] = await Form.query().count()

  if (count > 0) {
    console.log('  Form(s) already exist in database. Skipping.')
    return
  }

  const formPath = formPaths[process.env.INSTANCE_NAME]

  if (!formPath) {
    console.log(
      `  No form file known for '${process.env.INSTANCE_NAME}' instance type. No forms were added to the database.`,
    )
    return
  }

  const submissionFormStructure = require(formPath)
  const reviewFormStructure = require(formPaths.review)
  const decisionFormStructure = require(formPaths.decision)

  const submissionForm = {
    purpose: 'submit',
    structure: submissionFormStructure,
    category: 'submission',
  }

  const reviewForm = {
    purpose: 'review',
    structure: reviewFormStructure,
    category: 'review',
  }

  const decisionForm = {
    purpose: 'decision',
    structure: decisionFormStructure,
    category: 'decision',
  }

  await Form.query().insert(submissionForm)
  await Form.query().insert(reviewForm)
  await Form.query().insert(decisionForm)
  console.log(`  Added submission form ${formPath} to database.`)
}

module.exports = seed
