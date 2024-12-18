import { getBy } from '../../../shared/generalUtils'
import { EMAIL_VALIDATION_REGEX, REQUIRED_TEMPLATES_LIST } from './constants'

const { values } = Object
// #region Validation ------------------------------------------------------------------------

/**
 * Validates a comma-separated list of email addresses.
 * @param {string} cc - Comma-separated list of email addresses.
 * @returns {boolean} - Returns true if there are invalid emails, otherwise false.
 */
export const validateCC = cc => {
  const emailList = cc.split(',').map(email => email.trim())

  const invalidEmails = emailList.filter(
    email => !EMAIL_VALIDATION_REGEX.test(email),
  )

  return invalidEmails.length > 0
}

/**
 * Validates the description against the active template description and checks if it exists in other templates.
 * @param {string} description - The description to validate.
 * @param {string} activeTemplateDescription - The description of the currently active template.
 * @param {Array} emailTemplates - List of email templates.
 * @returns {boolean} - Returns true if the description exists in another template, otherwise false.
 */
export const validateDescription = (
  description,
  activeTemplateDescription,
  emailTemplates,
) => {
  const descriptionUpdated = description !== activeTemplateDescription
  const templateCriteria = { 'emailContent.description': description }
  const [foundTemplate] = getBy(templateCriteria, emailTemplates)
  const descriptionExists = descriptionUpdated && !!foundTemplate

  return descriptionExists
}

// #endregion Validation ---------------------------------------------------------------------

// #region EmailTemplates --------------------------------------------------------------------

/**
 * Extracts email content from the given data object.
 * @param {Object} data - The data object containing email content.
 * @param {string} [data.subject] - The subject of the email.
 * @param {string} [data.cc] - The CC field of the email.
 * @param {string} [data.body] - The body of the email.
 * @param {string} [data.description] - The description of the email.
 * @param {boolean} [data.ccEditors] - Flag indicating if CC editors are included.
 * @returns {Object} - An object containing the email content.
 */
export const getEmailContentFrom = data => ({
  subject: data?.subject ?? '',
  cc: data?.cc ?? '',
  body: data?.body ?? '',
  description: data?.description ?? '',
  ccEditors: data?.ccEditors ?? false,
})

/**
 * Checks if the template has changed by comparing the active template's values with the current values.
 *
 * @param {Object} activeTemplate - The active template object.
 * @param {Object} activeTemplate.emailContent - The email content of the active template.
 * @param {string[]} activeTemplate.emailContent.ccEditors - The CC editors of the active template.
 * @param {string} activeTemplate.emailContent.description - The description of the active template.
 * @param {string} activeTemplate.emailContent.body - The body of the active template.
 * @param {string} activeTemplate.emailContent.subject - The subject of the active template.
 * @param {string[]} activeTemplate.emailContent.cc - The CC recipients of the active template.
 * @param {Object} currentValues - The current values to compare against the active template.
 * @returns {boolean} - Returns true if the template has changed, otherwise false.
 */
export const templateHasChanged = (activeTemplate, currentValues) => {
  const { ccEditors, description, body, subject, cc } =
    activeTemplate?.emailContent ?? {}

  const templateValues = [ccEditors, description, body, subject, cc]
  const currentValuesArray = values(currentValues)

  const hasChanged =
    currentValuesArray.length === templateValues.length &&
    currentValuesArray
      .sort()
      .some((value, index) => value !== templateValues.sort()[index])

  return hasChanged
}

/**
 * Checks if the template belongs to system templates(mandatory) based on its type.
 *
 * @param {Object} template - The template object.
 * @param {string} template.emailTemplateType - The type of the email template.
 * @returns {boolean} - Returns true if the template is required.
 */
export const isSystemTemplate = template => {
  const { emailTemplateType } = template
  return REQUIRED_TEMPLATES_LIST.includes(emailTemplateType)
}

/**
 * Checks if the template belongs to custom templates(optional) based on its type.
 *
 * @param {Object} template - The template object.
 * @param {string} template.emailTemplateType - The type of the email template.
 * @returns {boolean} - Returns true if the template not required
 */
export const isCustomTemplate = template => {
  const { emailTemplateType } = template
  return !REQUIRED_TEMPLATES_LIST.includes(emailTemplateType)
}
// #endregion EmailTemplates -----------------------------------------------------------------
