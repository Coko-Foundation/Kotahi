const models = require('@pubsweet/models')

const getActiveForms = async () =>
  models.Form.query()
    .where({ category: 'submission', purpose: 'submit' })
    .orWhere({ category: 'review', purpose: 'review' })
    .orWhere({ category: 'decision', purpose: 'decision' })

/** For form for given purpose and category, return a list of all fields that are not confidential, each in the form
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
