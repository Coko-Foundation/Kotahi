const Handlebars = require('handlebars')
const { clientUrl } = require('@coko/server')
const { Group } = require('../models')
const { objIf, transformEntries } = require('../server/utils/objectUtils')

const HANDLEBARS_NON_FORM_VARIABLES = [
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
 * Transforms form keys by capitalizing each part of the property name
 * and prefixes it with the form category.
 *
 * This transformed key is what handlebars expects to map the values and get the actual form values.
 *
 * @param {string} category - The category prefix.
 * @param {string} name - The key in the form object, e.g., 'submission.$someValue'.
 * @returns {string} - The transformed key, e.g., 'submissionSomeValue'.
 */
const overrideFormKeys = (category, name) => {
  if (!name.trim()) return ''
  const [, property = name.split('.').pop()] = name.split('.')
  const no$ = property.replace('$', '')
  const capitalizedKey = `${no$.charAt(0).toUpperCase()}${no$.slice(1)}`

  return `${category}${capitalizedKey}`
}

/**
 * Transforms the keys of the form object to match the variable name printed on the template.
 * This is to avoid issues with wax and '$' (eg.: case when inserting math nodes)
 * So, for example instead of: 'submission.$someValue' we would have 'submissionSomeValue'
 *
 * It takes the form object, removes any leading '$' character from the keys,
 * capitalizes the first letter of each key, and prefixes it with the form name.
 * The transformed keys are then used to pass the corresponding form values to handlebars.
 *
 * @param {Object} submission - The form object with keys to be transformed.
 * @returns {Object} - A new object with transformed keys and the corresponding values from the form object.
 */
const transformFormToMatchOverridenKeys = form => {
  const [name, value] = Object.entries(form)[0]
  return transformEntries(value, (k, v) => {
    const newKey = overrideFormKeys(name, k)
    // TODO: Handle non string values(maybe html for lists?)
    return { [newKey]: String(v) }
  })
}

const getManuscriptLink = async (appUrl, userId, manuscriptId) => {
  const {
    getUserRolesInManuscript,
    // eslint-disable-next-line global-require
  } = require('../server/model-user/src/userCommsUtils')

  const roles = manuscriptId
    ? await getUserRolesInManuscript(userId, manuscriptId)
    : {}

  let manuscriptPageUrl = `${appUrl}/versions/${manuscriptId}`

  if (roles?.groupManager || roles?.anyEditor) {
    manuscriptPageUrl += '/decision?tab=decision'
  } else if (roles?.reviewer || roles?.collaborativeReviewer) {
    manuscriptPageUrl += '/review'
  } else if (roles?.author) {
    manuscriptPageUrl += '/submit'
  } else {
    manuscriptPageUrl = `${appUrl}/dashboard`
  }

  return manuscriptPageUrl
}

const processData = async (data, groupId) => {
  const { manuscript, user, discussionUrl, recipientUser, ...rest } = data
  const { submission } = manuscript || {}
  const group = await Group.query().findById(groupId)
  const appUrl = `${clientUrl}/${group.name}`

  const manuscriptLink = await getManuscriptLink(
    appUrl,
    user?.id,
    manuscript?.id,
  )

  const manuscriptProductionLink = `${appUrl}/versions/${manuscript?.id}/production`
  const author = manuscript ? await manuscript.getManuscriptAuthor() : {}

  const recipientData = {
    recipientName: recipientUser?.username,
    recipientEmail: recipientUser?.email,
  }

  const manuscriptData = {
    authorName: author?.username,
    manuscriptNumber: manuscript?.shortId,
    manuscriptTitle: submission?.$title,
    manuscriptTitleLink: submission?.$sourceUri,
    ...objIf(submission, transformFormToMatchOverridenKeys({ submission })),
  }

  const linkNodes = {
    discussionUrl: `<a href="${discussionUrl}" target="_blank">${discussionUrl}</a>`,
    acceptInviteLink: `<a href="${appUrl}/acceptarticle/${data.invitationId}" target="_blank">Accept Invitation</a>`,
    declineInviteLink: `<a href="${appUrl}/decline/${data.invitationId}" target="_blank">Decline Invitation</a>`,
    loginLink: `<a href="${appUrl}/login" target="_blank">${appUrl}/login</a>`,
    manuscriptTitleLink: manuscriptData.manuscriptTitleLink
      ? `<a href="${manuscriptData.manuscriptTitleLink}">${manuscriptData.manuscriptTitle}</a>`
      : manuscriptData.manuscriptTitle,
    manuscriptLink: `<a href="${manuscriptLink}" target="_blank">${manuscriptLink}</a>`,
    manuscriptProductionLink: `<a href="${manuscriptProductionLink}" target="_blank">${manuscriptProductionLink}</a>`,
  }

  return {
    appUrl,
    user,
    ...rest,
    ...recipientData,
    ...manuscriptData,
    ...linkNodes,
  }
}

const useHandlebars = (template, data) => {
  if (!data) return template
  const compile = Handlebars.compile(template)
  const compiledTemplate = compile(data)
  return compiledTemplate
}

module.exports = {
  HANDLEBARS_NON_FORM_VARIABLES,
  overrideFormKeys,
  processData,
  useHandlebars,
}
