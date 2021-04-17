#! usr/bin/env node

const { Form } = require('@pubsweet/models')
const submissionFormStructure = require('../app/storage/forms/submit.json')

const submissionForm = { purpose: 'submit', structure: submissionFormStructure }
Form.createForm(null, { form: submissionForm }) //TODO how do I do this?
