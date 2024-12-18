/**
 * Finds an email template of a specific type from the given array of templates.
 *
 * @param {string} type - The type of the email template to find.
 * @returns {Object|undefined} The found email template object, or undefined if not found.
 */
const findTemplate = (type, templates) => {
  return templates.find(({ emailTemplateType }) => emailTemplateType === type)
}

/**
 * Transforms an email template to match the schema that '@rjsf/core' expects.
 *
 * @param {Object} template - The email template object.
 * @returns {Object} The transformed template in the structure required by '@rjsf/core'.
 */
const transformTemplate = template => ({
  const: template.id,
  title: template.emailContent.description,
})

/**
 * Transforms the given templates to match the schema that '@rjsf/core' expects.
 * @note The return value is specific to ConfigManagerForm schema implementation.
 *
 * @param {Array} templates - Array of email templates objects.
 * @returns {Object} The transformed templates in the structure required by '@rjsf/core' Form schema.
 */
const emailTemplatesToSchema = templates => {
  const find = type => findTemplate(type, templates)
  const emailNotificationOptions = templates.map(transformTemplate)
  const authorProofingSubmitted = find('authorProofingSubmitted')
  const reviewerInvitation = find('reviewerInvitation')
  const collaborativeReviewerInvite = find('collaborativeReviewerInvitation')
  const authorProofingInvitation = find('authorProofingInvitation')

  return {
    emailNotificationOptions,
    defaultReviewerInvitationTemplate: transformTemplate(reviewerInvitation),
    defaultAuthorProofingInvitationTemplate: transformTemplate(
      authorProofingInvitation,
    ),
    defaultAuthorProofingSubmittedTemplate: transformTemplate(
      authorProofingSubmitted,
    ),
    defaultCollaborativeReviewerInvitationTemplate: transformTemplate(
      collaborativeReviewerInvite,
    ),
  }
}

export default emailTemplatesToSchema
