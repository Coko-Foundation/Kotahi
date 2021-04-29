/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */

const { Form } = require('@pubsweet/models')

const formPaths = {
  aperture: '../app/storage/forms-aperture/submit.json',
  colab: '../app/storage/forms-colab/submit.json',
  elife: '../app/storage/forms/submit.json',
  ncrc: '../app/storage/forms-ncrc/submit.json',
}

const seed = async () => {
  const [{ count }] = await Form.query().count()

  if (count > 0) {
    console.log('  Form(s) already exist in database. Skipping.')
    process.exit()
  } else {
    const formPath = formPaths[process.env.INSTANCE_NAME]

    if (!formPath) {
      console.log(
        `  No form file known for '${process.env.INSTANCE_NAME}' instance type. No forms were added to the database.`,
      )
      return
    }

    const submissionFormStructure = require(formPath)

    const submissionForm = {
      purpose: 'submit',
      structure: submissionFormStructure,
    }

    await Form.query().insert(submissionForm)
    console.log(`  Added submission form ${formPath} to database.`)
    process.exit()
  }
}

module.exports = seed
