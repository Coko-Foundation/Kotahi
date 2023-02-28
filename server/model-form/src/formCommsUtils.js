const models = require('@pubsweet/models')

const getActiveForms = async () => {
  const forms = await models.Form.query()
    .where({ category: 'submission', purpose: 'submit' })
    .orWhere({ category: 'review', purpose: 'review' })
    .orWhere({ category: 'decision', purpose: 'decision' })

  return {
    submissionForm: forms.find(f => f.purpose === 'submit'),
    reviewForm: forms.find(f => f.purpose === 'review'),
    decisionForm: forms.find(f => f.purpose === 'decision'),
  }
}

/** For form for given purpose and category, return a list of all fields that are not confidential, each structured as
 * { name, title, component }
 */
const getPublicFields = async (purpose, category) => {
  const forms = await models.Form.query().where({
    category,
    purpose,
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
