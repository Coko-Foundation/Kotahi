#! usr/bin/env node
/* eslint-disable no-console */

const { Form } = require('@pubsweet/models')
const submissionFormStructure = require('../app/storage/forms/submit.json')

const submissionForm = { purpose: 'submit', structure: submissionFormStructure }

const seed = async () => {
  const [{ count }] = await Form.query().count()

  if (count > 0) {
    console.log('  Form(s) already exist in database. Skipping.')
  } else {
    await Form.query().insert(submissionForm)
    console.log('  Added submission form to database.')
  }
}

seed()
