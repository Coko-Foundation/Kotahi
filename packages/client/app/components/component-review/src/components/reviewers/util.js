// eslint-disable-next-line import/prefer-default-export
export const selectReviewerInvitationEmail = (
  config,
  emailTemplates,
  isCollaborative,
) => {
  let reviewerInvitationEmailTemplate

  if (config.eventNotification?.reviewerInvitationPrimaryEmailTemplate) {
    reviewerInvitationEmailTemplate =
      config.eventNotification.reviewerInvitationPrimaryEmailTemplate
  } else if (isCollaborative) {
    reviewerInvitationEmailTemplate = emailTemplates.find(
      template =>
        template.emailTemplateType === 'reviewerCollaborativeInvitation',
    ).id
  } else {
    reviewerInvitationEmailTemplate = emailTemplates.find(
      template => template.emailTemplateType === 'reviewerInvitation',
    ).id
  }

  return reviewerInvitationEmailTemplate
}
