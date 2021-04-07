/// <reference types="Cypress" />
/**
 * Page component representing the fourth option in the left side menu,
 * where users can see the list of submitted manuscripts & select Control,
 * View or Delete.
 */
const MANUSCRIPTS_OPTIONS_LIST = '[class*=style__UserAction]'
const BUTTON = 'button'
const MANUSCRIPTS_PAGE_TITLE = '[class*=General__Heading-sc]'
const EVALUATION_BUTTON = '[href*=evaluation]'
const CONTROL_BUTTON = '[href*=control]'
const CREATED_CARET = 'Carets__Caret'
const AUTHOR_FIELD = 'UserCombo__Primary'
const STATUS_FIELD = 'Badge__Status'
const MANUSCRIPTS_TABLE_HEAD = '[class*=Table__Header] > tr >th'
const ARTICLE_TITLE = '[class*=Table__Row]>td:nth-child(1)'
const ARTICLE_LABEL = 'style__StyledTableLabel'
const ARTICLE_TOPIC = '[class*=Table__Cell] > [title]'
const TABLE_ROW = 'Table__Row'
const LABEL = '[class*=Table__Row]>td:nth-child(6)'

export const ManuscriptsPage = {
  getManuscriptsOptionsList() {
    return cy.get(MANUSCRIPTS_OPTIONS_LIST)
  },
  selectOptionWithText(text) {
    this.getManuscriptsOptionsList().contains(text).click()
  },
  getOptionWithText(text) {
    return this.getManuscriptsOptionsList().contains(text)
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
  getAuthorField(nth) {
    return cy.getByContainsClass(AUTHOR_FIELD).eq(nth)
  },
  getAuthor(nth) {
    return this.getAuthorField(nth).invoke('text')
  },
  getStatusField(nth) {
    return cy.getByContainsClass(STATUS_FIELD).eq(nth)
  },
  getStatus(nth) {
    return this.getStatusField(nth).invoke('text')
  },
  getTableHead(nth) {
    return cy.get(MANUSCRIPTS_TABLE_HEAD).eq(nth)
  },
  getArticleTitleByRow(nth) {
    return cy.get(ARTICLE_TITLE).eq(nth)
  },
  clickTableHead(nth) {
    this.getTableHead(nth).click()
  },
  getArticleLabel() {
    return cy.getByContainsClass(ARTICLE_LABEL)
  },
  getArticleTopic(nth) {
    return cy.get(ARTICLE_TOPIC).eq(nth)
  },
  clickArticleTopic(nth) {
    this.getArticleTopic(nth).click()
  },
  getTableRows() {
    return cy.getByContainsClass(TABLE_ROW).its('length')
  },
  getLabelRow(nth) {
    return cy.get(LABEL).eq(nth)
  },
}
export default ManuscriptsPage
