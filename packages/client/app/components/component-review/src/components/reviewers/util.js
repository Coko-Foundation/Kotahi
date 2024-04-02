// eslint-disable-next-line import/prefer-default-export
export const selectReviewerInvitationEmail = (
  config,
  emailTemplates,
  isCollaborative,
) => {
  let reviewerInvitationEmailTemplate

  if (
    !isCollaborative &&
    config.eventNotification?.reviewerInvitationPrimaryEmailTemplate
  ) {
    reviewerInvitationEmailTemplate =
      config.eventNotification.reviewerInvitationPrimaryEmailTemplate
  } else if (
    isCollaborative &&
    config.eventNotification
      ?.reviewerCollaborativeInvitationPrimaryEmailTemplate
  ) {
    reviewerInvitationEmailTemplate =
      config.eventNotification
        .reviewerCollaborativeInvitationPrimaryEmailTemplate
  } else if (isCollaborative) {
    reviewerInvitationEmailTemplate = emailTemplates.find(
      template =>
        template.emailTemplateType === 'collaborativeReviewerInvitation',
    ).id
  } else {
    reviewerInvitationEmailTemplate = emailTemplates.find(
      template => template.emailTemplateType === 'reviewerInvitation',
    ).id
  }

  return reviewerInvitationEmailTemplate
}
