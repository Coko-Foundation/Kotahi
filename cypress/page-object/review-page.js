/// <reference types="Cypress" />
/**
 * Page object representing the article review page,
 * where reviewers can leave comments, approve or reject the article.
 */
const REVIEW_METADATA_CELL = 'ReviewMetadata__Cell'
const REVIEW_COMMENT_FIELD = 'reviewComment'
const CONFIDENTIAL_COMMENT_FIELD = 'confidentialComment'
const ACCEPT_RADIO_BUTTON = 'span[color=green]'
const SUBMIT_BUTTON = '[class*=General__SectionAction] > button'
const CONTENT_ETIDABLE_VALUE = '[contenteditable="true"]'
const DECISION_COMMENT_FIELD = 'decisionComment'
const ERROR_TEXT = 'style__ErrorText-'
const FORM_STATUS = 'style__FormStatus-'
const PUBLISH_BUTTON = 'button[type="button"]'

// eslint-disable-next-line import/prefer-default-export
export const ReviewPage = {
  getReviewMetadataCell(nth) {
    return cy.getByContainsClass(REVIEW_METADATA_CELL).eq(nth)
  },
  getReviewCommentField() {
    return cy.getByDataTestId(REVIEW_COMMENT_FIELD)
  },
  fillInReviewComment(reviewComment) {
    this.getReviewCommentField()
      .find(CONTENT_ETIDABLE_VALUE)
      .fillInput(reviewComment)
  },
  getConfidentialCommentField() {
    return cy.getByDataTestId(CONFIDENTIAL_COMMENT_FIELD)
  },
  fillInConfidentialComment(confidentialComment) {
    this.getConfidentialCommentField()
      .find(CONTENT_ETIDABLE_VALUE)
      .fillInput(confidentialComment)
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

  //
  getDecisionCommentField() {
    return cy.getByDataTestId(DECISION_COMMENT_FIELD)
  },
  clickDecisionCommandField() {
    this.getDecisionCommentField().click().focused().blur()
  },
  fillInDecisionComment(decisionComment) {
    this.getDecisionCommentField()
      .find(CONTENT_ETIDABLE_VALUE)
      .fillInput(decisionComment)
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
}
