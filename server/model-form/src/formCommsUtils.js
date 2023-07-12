const models = require('@pubsweet/models')

const getActiveForms = async groupId => {
  const forms = await models.Form.query()
    .where({ category: 'submission', purpose: 'submit', groupId })
    .orWhere({ category: 'review', purpose: 'review', groupId })
    .orWhere({ category: 'decision', purpose: 'decision', groupId })

  return {
    submissionForm: forms.find(f => f.purpose === 'submit'),
    reviewForm: forms.find(f => f.purpose === 'review'),
    decisionForm: forms.find(f => f.purpose === 'decision'),
  }
}

/** For form for given purpose and category, return a list of all fields that are not confidential, each structured as
 * { name, title, component }
 */
const getPublicFields = async (purpose, category, groupId) => {
  const forms = await models.Form.query().where({
    category,
    purpose,
    groupId,
  })

  if (!forms.length) return []
  const form = forms[0]

  return form.structure.children
    .filter(field => !field.hideFromAuthors)
    .map(field => ({
      name: field.name,
      title: field.shortDescription || field.title,
      component: field.component,
    }))
}

module.exports = { getPublicFields, getActiveForms }
