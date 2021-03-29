/// <reference types="Cypress" />
/**
 * Page component representing the fourth option in the left side menu,
 * where users can see the list of submitted manuscripts & select Control,
 * View or Delete.
 */
const MANUSCRIPTS_OPTIONS_LIST = '[class*=Table__LastCell] > a'
const BUTTON = 'button'
const MANUSCRIPTS_PAGE_TITLE = '[class*=General__Heading-sc]'
const EVALUATION_BUTTON = '[href*=evaluation]'
const CONTROL_BUTTON = '[href*=control]'
const CREATED_CARET = 'Carets__Caret'

export const ManuscriptsPage = {
  getManuscriptsOptionsList() {
    return cy.get(MANUSCRIPTS_OPTIONS_LIST)
  },
  selectOptionWithText(text) {
    this.getManuscriptsOptionsList().contains(text).click()
  },
  getSubmitButton() {
    return cy.get(BUTTON).contains('New submission')
  },
  clickSubmit() {
    this.getSubmitButton().click()
  },
  getManuscriptsPageTitle() {
    return cy.get(MANUSCRIPTS_PAGE_TITLE)
  },
  getEvaluationButton() {
    return cy.get(EVALUATION_BUTTON)
  },
  clickEvaluation() {
    this.getEvaluationButton().click()
  },
  getControlButton() {
    return cy.get(CONTROL_BUTTON)
  },
  getCreatedCaret(nth) {
    return cy.getByContainsClass(CREATED_CARET).eq(nth)
  },
}
export default ManuscriptsPage
