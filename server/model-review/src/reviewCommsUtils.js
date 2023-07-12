const models = require('@pubsweet/models')

const getForm = async categoryAndPurpose => {
  const form = await models.Form.query().where(categoryAndPurpose)
  if (!form || !form.length)
    throw new Error(`No form found for "${categoryAndPurpose.purpose}"`)
  return form[0]
}

const getReviewForm = async groupId =>
  getForm({ category: 'review', purpose: 'review', groupId })

const getDecisionForm = async groupId =>
  getForm({ category: 'decision', purpose: 'decision', groupId })

const getSubmissionForm = async groupId =>
  getForm({ category: 'submission', purpose: 'submit', groupId })

module.exports = { getReviewForm, getDecisionForm, getSubmissionForm }
