#! usr/bin/env node

const { Form } = require('@pubsweet/models')
const submissionFormStructure = require('../app/storage/forms/submit.json')

const submissionForm = { purpose: 'submit', structure: submissionFormStructure }

const seed = async () => {
  await Form.query().insert(submissionForm)
}

seed()
