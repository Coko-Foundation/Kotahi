const eventsSource = {
  // #region Manuscript
  'manuscript-submit': {
    notificationType: 'email',
  },
  'manuscript-new-version': {
    notificationType: 'email',
  },
  'manuscript-import': {
    notificationType: 'email',
  },
  'manuscript-publish': {
    notificationType: 'email',
  },
  // #endregion Manuscript
  // #region Review
  'review-invitation': {
    recipient: 'registeredUser',
    notificationType: 'email',
  },
  'review-invitation-follow-up': {
    notificationType: 'email',
    delay: 2,
  },
  'review-accepted': {
    notificationType: 'email',
    delay: 2,
  },
  'review-rejected': {
    recipient: 'registeredUser',
    notificationType: 'email',
  },
  'review-completed': {
    notificationType: 'email',
  },
  // #endregion Review
  // #region Collaborative Review
  'collaborative-review-invitation': {
    recipient: 'registeredUser',
    notificationType: 'email',
  },
  'collaborative-review-invitation-follow-up': {
    notificationType: 'email',
    delay: 2,
  },
  'collaborative-review-accepted': {
    notificationType: 'email',
  },
  'collaborative-review-rejected': {
    recipient: 'registeredUser',
    notificationType: 'email',
  },
  'collaborative-review-lock': {
    notificationType: 'email',
  },
  'collaborative-review-unlock': {
    notificationType: 'email',
  },
  // #endregion Collaborative Review
  // #region Author Invitation
  'author-invitation': {
    recipient: 'registeredUser',
    notificationType: 'email',
  },
  'author-accepted': {
    notificationType: 'email',
  },
  'author-rejected': {
    notificationType: 'email',
  },
  'author-invitation-follow-up': {
    notificationType: 'email',
    delay: 2,
  },
  // #endregion Author Invitation
  // #region Chat
  'chat-unread': {
    recipient: 'registeredUser',
    notificationType: 'email',
  },
  'chat-mention': {
    recipient: 'registeredUser',
    notificationType: 'email',
  },
  // #endregion Chat
  // #region Author Proofing
  'author-proofing-assign': {
    recipient: 'registeredUser',
    notificationType: 'email',
  },
  'author-proofing-submit-feedback': {
    notificationType: 'email',
  },
  // #endregion Author Proofing
  // #region Team assignment
  'team-editor-assigned': {
    notificationType: 'email',
  },
  'team-editor-unassigned': {
    notificationType: 'email',
  },
  // #endregion Team assignment
  // #region User
  'user-first-login': {
    notificationType: 'email',
  },
  'user-set-group-role': {
    notificationType: 'email',
  },
  'user-delete': {
    notificationType: 'email',
  },
  // #endregion User
  // #region Decision form
  'decision-form-make-decision': {
    notificationType: 'email',
    recipient: 'registeredUser',
  },
  'decision-form-make-decision-with-verdict': {
    notificationType: 'email',
  },
  'decision-form-complete-comment': {
    notificationType: 'email',
  },
  // #endregion Decision form
}

module.exports = eventsSource
