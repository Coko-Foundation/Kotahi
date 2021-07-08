/// <reference types="Cypress" />
/**
 * Page object representing the article review page,
 * where reviewers can leave comments, approve or reject the article.
 */
const REVIEW_METADATA_CELL = 'ReviewMetadata__Cell'

const ABSTRACT_EDITOR_FIELD =
  '[class*=SimpleWaxEditor__Editor] > [contenteditable]'

// const REVIEW_COMMENT_FIELD = 'reviewComment'
// const CONFIDENTIAL_COMMENT_FIELD = 'confidentialComment'
const ACCEPT_RADIO_BUTTON = 'span[color=green]'
const SUBMIT_BUTTON = '[class*=General__SectionAction] > button'
// const DECISION_COMMENT_FIELD = 'decisionComment'
const ERROR_TEXT = 'style__ErrorText-'
const FORM_STATUS = 'style__FormStatus-'
const PUBLISH_BUTTON = 'button[type="button"]'
const CAN_BE_PUBLISHED_PUBLICALY_CHECKBOX = '[name=canBePublishedPublicly]'

// eslint-disable-next-line import/prefer-default-export
export const ReviewPage = {
  getReviewMetadataCell(nth) {
    return cy.getByContainsClass(REVIEW_METADATA_CELL).eq(nth)
  },
  getReviewCommentField() {
    return cy.get(ABSTRACT_EDITOR_FIELD).eq(0)
  },
  fillInReviewComment(reviewComment) {
    this.getReviewCommentField().fillInput(reviewComment)
  },
  getConfidentialCommentField() {
    return cy.get(ABSTRACT_EDITOR_FIELD).eq(1)
  },
  fillInConfidentialComment(confidentialComment) {
    this.getConfidentialCommentField().fillInput(confidentialComment)
  },
  getAcceptRadioButton() {
    return cy.get(ACCEPT_RADIO_BUTTON)
  },
  clickAccept() {
    this.getAcceptRadioButton().click()
  },
  getSubmitButton() {
    return cy.get(SUBMIT_BUTTON)
  },
  clickSubmit() {
    this.getSubmitButton().click()
  },
  getDecisionCommentField() {
    return cy.GET(ABSTRACT_EDITOR_FIELD)
  },
  clickDecisionCommandField() {
    this.getDecisionCommentField().click().focused().blur()
  },
  fillInDecisionComment(decisionComment) {
    this.getDecisionCommentField().fillInput(decisionComment)
  },
  getErrorText() {
    return cy.getByContainsClass(ERROR_TEXT)
  },
  getFormStatus() {
    return cy.getByContainsClass(FORM_STATUS)
  },
  getPublishButton() {
    return cy.get(PUBLISH_BUTTON)
  },
  clickPublish() {
    this.getSubmitButton().eq(1).click()
  },
  waitThreeSec() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
  },
  getCanBePublishedPublicalyCheckbox() {
    return cy.get(CAN_BE_PUBLISHED_PUBLICALY_CHECKBOX)
  },
  clickCanBePublishedPublicly() {
    this.getCanBePublishedPublicalyCheckbox().click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
  },
}
