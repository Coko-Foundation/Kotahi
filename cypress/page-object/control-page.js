/// <reference types="Cypress" />
/**
 * Page object representing the Control page,
 * which can be accessed either through the Dashboard page
 * ('Manuscripts I'm editor of' section)
 * or through the Manuscripts page.
 */
const MANAGE_REVIEWERS_BUTTON = '[class*=General__SectionRow] > a'

const DECISION_FIELD = '[contenteditable="true"]'

const PUBLISH_BUTTON = '[class*=General__SectionAction-sc-1chiust-11] > .sc-bkzZxe'
const PUBLISH_INFO_MESSAGE = 'General__SectionActionInfo-sc-1chiust-12'
const ASSIGN_SENIOR_EDITOR_DROPDOWN = 'Assign seniorEditor'
const ASSIGN_HANDLING_EDITOR_DROPDOWN = 'Assign handlingEditor'
const ASSIGN_EDITOR_DROPDOWN = 'Assign editor'
const DROPDOWN_OPTION_LIST = ' [class*=MenuList] > [id*=option]'
const METADATA_TAB = 'HiddenTabs__TabContainer-sc-11z25w4-2'
const METADATA_CELL = 'VersionSwitcher__Title'
const ERROR_TEXT = 'style__ErrorText-'
const ACCEPT_RADIO_BUTTON = '.ALZiZ > .sc-dmlrTW'
const REVISE_RADIO_BUTTON = 'span[color=orange]'
const REJECT_RADIO_BUTTON = 'span[color=red]'
const SUBMIT_BUTTON = '.ActionButton__BaseButton-sc-1ja3w98-0'
const FORM_STATUS = 'style__FormStatus-'
const ASSIGN_EDITORS_DROPDOWN = '[class*=General__SectionRow] > [class]'
const SHOW_BUTTON = '[class*=DecisionReview__Controls]>[type*=button]'

const REVIEW_MESSAGE =
  '[class*=DecisionReview__Root] [class*=SimpleWaxEditor__ReadOnly] > div > [class*=paragraph]'

const REVIEW_OPTION_CHECKBOX =
  '[class*=DecisionReview__StyledCheckbox] > [type=checkbox]'

const REVIEWER_NAME = '[class*=DecisionReview__Name]'
const NO_REVIEWS_MESSAGE = '[class*=General__SectionRow]'
const ACCEPTED_TO_PUBLISH_REVIEW_ICON = '[class*=DecisionReview__Name] > svg'
const EMAIL_NOTIFICATION_SECTION = 'emailNotifications__RowGridStyled'
const NEW_USER_CHECKBOX = '[class*=emailNotifications__RowGridStyled] > label'
const NEW_USER_EMAIL_FIELD = '[placeholder="Email"]'
const NEW_USER_NAME_FIELD = '[placeholder="Name"]'

const EMAIL_NOTIFICATION_DROPDOWNS =
  '[class*=emailNotifications__RowGridStyled] > div'

const NOTIFY_BUTTON = '[class*=emailNotifications__RowGridStyled] > button'
const CHAT_TAB = '[class*=General__Chat] [data-test-id=tab-container]'
const EMAIL_NOTIFICATION_LOG_MESSAGE = 'style__InnerMessageContainer'

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
  getDecisionField(nth) {
    return cy.get(DECISION_FIELD).eq(nth)
  },
  fillInDecision(decision) {
    this.getDecisionField(0).fillInput(decision)
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
  getAssignSeniorEditorDropdown() {
    return cy.getByContainsAriaLabel(ASSIGN_SENIOR_EDITOR_DROPDOWN)
  },
  clickAssignSeniorEditorDropdown() {
    this.getAssignSeniorEditorDropdown().click({ force: true })
  },
  getAssignHandlingEditorDropdown() {
    return cy.getByContainsAriaLabel(ASSIGN_HANDLING_EDITOR_DROPDOWN)
  },
  clickAssignHandlingEditorDropdown() {
    this.getAssignHandlingEditorDropdown().click({ force: true })
  },
  getAssignEditorDropdown() {
    return cy.getByContainsAriaLabel(ASSIGN_EDITOR_DROPDOWN)
  },
  clickAssignEditorDropdown() {
    this.getAssignEditorDropdown().click({ force: true })
  },
  getDropdownOptionList() {
    return cy.get(DROPDOWN_OPTION_LIST)
  },
  selectDropdownOptionByName(name) {
    this.getDropdownOptionList().contains(name).click()
  },

  getMetadataCell() {
    return cy.getByContainsClass(METADATA_CELL)
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
  getReviseRadioButton() {
    return cy.get(REVISE_RADIO_BUTTON)
  },
  clickRevise() {
    this.getReviseRadioButton().click()
  },
  getRejectRadioButton() {
    return cy.get(REJECT_RADIO_BUTTON)
  },
  clickReject() {
    this.getRejectRadioButton().click()
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
    return cy.get(ACCEPTED_TO_PUBLISH_REVIEW_ICON)
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
  getEmailNotificationSection() {
    return cy.getByContainsClass(EMAIL_NOTIFICATION_SECTION)
  },
  getNewUserCheckbox() {
    return cy.get(NEW_USER_CHECKBOX)
  },
  clickNewUser() {
    this.getNewUserCheckbox().click()
  },
  getNewUserEmailField() {
    return cy.get(NEW_USER_EMAIL_FIELD)
  },
  fillInNewUserEmail(email) {
    this.getNewUserEmailField().fillInput(email)
  },
  getNewUserNameField() {
    return cy.get(NEW_USER_NAME_FIELD)
  },
  fillInNewUserName(name) {
    this.getNewUserNameField().fillInput(name)
  },
  getEmailNotificationDropdowns() {
    return cy.get(EMAIL_NOTIFICATION_DROPDOWNS)
  },
  clickEmailNotificationNthDropdown(nth) {
    this.getEmailNotificationDropdowns().eq(nth).click()
  },
  getNotifyButton() {
    return cy.get(NOTIFY_BUTTON)
  },
  clickNotify() {
    this.getNotifyButton().click()
  },
  getChatTab() {
    return cy.get(CHAT_TAB)
  },
  clickNthChatTab(nth) {
    this.getChatTab().eq(nth).click()
  },
  getLogMessage() {
    return cy.getByContainsClass(EMAIL_NOTIFICATION_LOG_MESSAGE)
  },
  getMetadataTab(nth) {
    return cy.getByContainsClass(METADATA_TAB).eq(nth)
  },
  getWorkflowTab() {
    return cy.get('[data-test-id=tab-container]').contains('Workflow')
  },
}
