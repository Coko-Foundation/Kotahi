const models = require('@pubsweet/models')

const getForm = async (categoryAndPurpose, options = {}) => {
  const { trx } = options

  const form = await models.Form.query(trx).where(categoryAndPurpose)

  if (!form || !form.length)
    throw new Error(`No form found for "${categoryAndPurpose.purpose}"`)

  return form[0]
}

const getReviewForm = async (groupId, options = {}) =>
  getForm({ category: 'review', purpose: 'review', groupId }, options)

const getDecisionForm = async (groupId, options = {}) =>
  getForm({ category: 'decision', purpose: 'decision', groupId }, options)

const getSubmissionForm = async (groupId, options = {}) =>
  getForm({ category: 'submission', purpose: 'submit', groupId }, options)

module.exports = { getReviewForm, getDecisionForm, getSubmissionForm }
