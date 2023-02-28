const models = require('@pubsweet/models')

const getForm = async categoryAndPurpose => {
  const form = await models.Form.query().where(categoryAndPurpose)
  if (!form || !form.length)
    throw new Error(`No form found for "${categoryAndPurpose.purpose}"`)
  return form[0]
}

const getReviewForm = async () =>
  getForm({ category: 'review', purpose: 'review' })

const getDecisionForm = async () =>
  getForm({ category: 'decision', purpose: 'decision' })

const getSubmissionForm = async () =>
  getForm({ category: 'submission', purpose: 'submit' })

module.exports = { getReviewForm, getDecisionForm, getSubmissionForm }
