const { capitalize } = require('lodash')
const Form = require('../../../models/form/form.model')

// Only submission form passed for now until we solve what to do with the reviews
const ALLOWED_FORMS = ['submission' /* , 'review', 'decision' */]

const HANDLEBARS_DEFAULT_VARS = [
  { label: 'Author Name', value: 'authorName' },
  { label: 'Sender Name', value: 'senderName' },
  { label: 'Sender ID', value: 'senderId' },
  { label: 'Recipient Name', value: 'recipientName' },
  { label: 'Recipient Name (Receiver Name)', value: 'receiverName' },
  { label: 'Status', value: 'status' },
  { label: 'Manuscript Number', value: 'manuscriptNumber' },
  { label: 'Manuscript Link', value: 'manuscriptLink', type: 'link' },
  { label: 'Manuscript Title', value: 'manuscriptTitle' },
  {
    label: 'Manuscript Title Link',
    value: 'manuscriptTitleLink',
    type: 'link',
  },
  {
    label: 'Manuscript Production Link',
    value: 'manuscriptProductionLink',
    type: 'link',
  },
  { label: 'Accept invitation link', value: 'acceptInviteLink', type: 'link' },
  {
    label: 'Decline invitation link',
    value: 'declineInviteLink',
    type: 'link',
  },
  { label: 'Discussion URL', value: 'discussionUrl', type: 'link' },
].map(v => ({ ...v, form: 'common', type: v.type || 'text' }))

/**
 * Transforms the form values to a format expected by Handlebars.
 * This is to avoid issues with wax and '$'
 *
 * It takes a string representing a key from the form: e.g., 'submission.$someValue',
 * removes any leading '$' and '.' characters, capitalizes the first letter of the key, and
 * prefixes it with the form category.
 *
 * This transformed key is what handlebars expects to map the values and get the actual form values.
 *
 * @param {string} value - The key in the form object, e.g., 'submission.$someValue'.
 * @returns {string} - The transformed key, e.g., 'submissionSomeValue'.
 */
const transformFormKeys = (category, value) => {
  if (!value.trim()) return ''
  const [, property = value] = value.split('.')
  const without$ = property.replace('$', '')
  const capitalizedValue = capitalize(without$)

  return `${category}${capitalizedValue}`
}

const buildOption = category => {
  return ({ name, title: label }) => {
    if (!name || !ALLOWED_FORMS.includes(category)) return false
    const value = transformFormKeys(category, name)

    const option = {
      value,
      label,
      type: 'text',
      form: category,
    }

    return option
  }
}

module.exports = {
  Query: {
    getVariables: async (_, { groupId }) => {
      const forms = await Form.query().where({ groupId })

      const formVars = forms.map(({ structure, category }) => {
        const { children } = structure
        const formMap = children.map(buildOption(category))
        return formMap.filter(Boolean)
      })

      const variables = [...HANDLEBARS_DEFAULT_VARS, ...formVars].flat()
      return variables
    },
  },
}
