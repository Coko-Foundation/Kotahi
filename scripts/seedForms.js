#! usr/bin/env node

const { Form } = require('@pubsweet/models')
const submissionFormStructure = require('../app/storage/forms/submit.json')

const submissionForm = { purpose: 'submit', structure: submissionFormStructure }
Form.query().insert(submissionForm)
