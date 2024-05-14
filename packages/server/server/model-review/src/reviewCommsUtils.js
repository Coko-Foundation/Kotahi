const getForm = async (categoryAndPurpose, options = {}) => {
  /* eslint-disable-next-line global-require */
  const Form = require('../../../models/form/form.model')
  const { trx } = options

  const form = await Form.query(trx).where(categoryAndPurpose)

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
