const Form = require('../models/form/form.model')

const {
  overrideFormKeys,
  HANDLEBARS_NON_FORM_VARIABLES,
} = require('../services/handlebars.service')

const ALLOWED_FORMS = ['submission' /* , 'review', 'decision' */]

/**
 * Builds an option object for a form variable.
 *
 * @param {string} category - The category of the form: eg.: submission, review, decision
 * @returns {(name: string, title: string) => {value: string, label: string, type: string, form: string} | false}
 */
const buildOption = category => {
  return ({ name, title: label }) => {
    if (!name || !ALLOWED_FORMS.includes(category)) return false
    const value = overrideFormKeys(category, name)

    const option = {
      value,
      label,
      type: 'text',
      form: category,
    }

    return option
  }
}

const getVariables = async groupId => {
  const forms = await Form.query().where({ groupId })

  const formVars = forms.map(({ structure, category }) => {
    const { children } = structure
    return children.map(buildOption(category)).filter(Boolean)
  })

  return [...HANDLEBARS_NON_FORM_VARIABLES, ...formVars].flat()
}

module.exports = {
  getVariables,
}
