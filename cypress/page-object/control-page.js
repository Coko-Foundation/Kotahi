/// <reference types="Cypress" />
/**
 * Page object representing the Control page,
 * which can be accessed either through the Dashboard page
 * ('Manuscripts I'm editor of' section)
 * or through the Manuscripts page.
 */
const MANAGE_REVIEWERS_BUTTON = '[class*=General__SectionRow] > a'

const DECISION_COMMENT_FIELD =
  '[class*=SimpleWaxEditor__Editor] > [contenteditable]'

const PUBLISH_BUTTON = '[class*=General__SectionAction] > button[type=button]'
const PUBLISH_INFO_MESSAGE = 'General__SectionActionInfo'
const ASSIGN_EDITOR_DROPDOWN = 'Assign seniorEditor'
const EDITOR_OPTION_LIST = '[class*=MenuList] > [id*=option]'
const METADATA_CELL = 'ReviewMetadata__Cell'
const ERROR_TEXT = 'style__ErrorText-'
const ACCEPT_RADIO_BUTTON = 'span[color=green]'
const SUBMIT_BUTTON = '[class*=General__SectionAction] > button[type=submit]'
const FORM_STATUS = 'style__FormStatus-'
const ASSIGN_EDITORS_DROPDOWN = '[class*=General__SectionRow] > [class]'
const SHOW_BUTTON = '[class*=DecisionReview__Controls]>[type*=button]'

const REVIEW_MESSAGE =
  '[class*=SimpleWaxEditor__ReadOnly]>div>[class*=paragraph]'

const REVIEW_OPTION_CHECKBOX = '[type=checkbox]'
const REVIEWER_NAME = '[class*=DecisionReview__Name]'
const NO_REVIEWS_MESSAGE = '[class*=General__SectionRow]'
const ACCEPTED_TO_PULISH_REVIEW_ICON = '[class*=DecisionReview__Name] >svg'

// eslint-disable-next-line import/prefer-default-export
export const ControlPage = {
  getManageReviewersButton() {
    return cy.get(MANAGE_REVIEWERS_BUTTON)
  },
  getAssignEditor(nth) {
    return cy.get(ASSIGN_EDITORS_DROPDOWN).eq(nth)
  },
  clickManageReviewers() {
    this.getManageReviewersButton().click()
  },
  getDecisionCommentField() {
    return cy.get(DECISION_COMMENT_FIELD)
  },
  clickAndBlurDecisionComment() {
    this.getDecisionCommentField().click().focused().blur()
  },
  clickDecisionComment() {
    this.getDecisionCommentField().click()
  },
  fillInDecisionComment(decisionComment) {
    this.getDecisionCommentField().fillInput(decisionComment)
  },
  getPublishButton() {
    return cy.get(PUBLISH_BUTTON)
  },
  clickPublish() {
    this.getPublishButton().click()
  },
  getPublishInfoMessage() {
    return cy.getByContainsClass(PUBLISH_INFO_MESSAGE).invoke('text')
  },
  getAssignEditorDropdown() {
    return cy.getByContainsAriaLabel(ASSIGN_EDITOR_DROPDOWN)
  },
  clickAssignEditorDropdown() {
    this.getAssignEditorDropdown().click({ force: true })
  },
  getEditorOptionList() {
    return cy.get(EDITOR_OPTION_LIST)
  },
  selectEditorByName(name) {
    this.getEditorOptionList().contains(name).click()
  },
  getMetadataCell(nth) {
    return cy.getByContainsClass(METADATA_CELL).eq(nth)
  },

  getErrorText() {
    return cy.getByContainsClass(ERROR_TEXT)
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
  getFormStatus() {
    return cy.getByContainsClass(FORM_STATUS)
  },
  getShowButton() {
    return cy.get(SHOW_BUTTON)
  },
  clickShow() {
    this.getShowButton().click()
  },
  getReviewMessage() {
    return cy.get(REVIEW_MESSAGE)
  },
  getHideReviewToAuthorCheckbox() {
    return cy.get(REVIEW_OPTION_CHECKBOX).eq(0)
  },
  clickHideReviewToAuthor() {
    this.getHideReviewToAuthorCheckbox().click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
  },
  getHideReviewerNameCheckbox() {
    return cy.get(REVIEW_OPTION_CHECKBOX).eq(1)
  },
  clickHideReviewerNameToAuthor() {
    this.getHideReviewerNameCheckbox().click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
  },
  getReviewerName() {
    return cy.get(REVIEWER_NAME)
  },
  waitThreeSec() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
  },
  getNoReviewsMessage() {
    return cy.get(NO_REVIEWS_MESSAGE)
  },
  getAcceptedToPublishReview() {
    return cy.get(ACCEPTED_TO_PULISH_REVIEW_ICON)
  },
  checkEditDateIsUpdated() {
    const getTodayDate = () => {
      const date = new Date()
      const year = date.getFullYear()
      let month = date.getMonth() + 1
      const day = date.getDate()

      if (month <= 9) {
        month = `0${month}`
      }

      return `${year}-${month}-${day}`
    }

    this.getMetadataCell(13).should('contain', getTodayDate())
  },
}
