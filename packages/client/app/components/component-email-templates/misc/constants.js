// #region Validation ---------------------------------------------------------------------
export const CC_ERROR = 'emailTemplate.validationMessages.invalidEmail'

export const DESCRIPTION_ERROR =
  'emailTemplate.validationMessages.duplicateDescription'

export const EMAIL_VALIDATION_REGEX =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

export const REQUIRED_TEMPLATES_LIST = [
  'reviewerInvitation',
  'systemEmail',
  'authorInvitation',
  'taskNotification',
  'collaborativeReviewerInvitation',
  'authorProofingInvitation',
  'authorProofingSubmitted',
]
// #endregion Validation ------------------------------------------------------------------

export const AUTOSAVE_DELAY = 1000

export const LABELS = {
  CUSTOM: 'Custom',
  SYSTEM: 'System',
  DRAFT_TEMPLATE: 'New Template',
}

export const DRAFT_TEMPLATE_OBJECT = {
  id: LABELS.DRAFT_TEMPLATE,
  emailContent: {
    description: LABELS.DRAFT_TEMPLATE,
  },
}
