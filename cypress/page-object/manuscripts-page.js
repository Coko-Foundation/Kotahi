/// <reference types="Cypress" />
import { evaluate } from '../support/routes'
import { ControlPage } from './control-page'

/**
 * Page component representing the fourth option in the left side menu,
 * where users can see the list of submitted manuscripts & select Control,
 * View or Delete.
 */
const MANUSCRIPTS_OPTIONS_LIST = '[class*=style__UserAction]'
const BUTTON = 'button'
const LIVE_CHAT_BUTTON = '[class*=VideoChatButton]'
const MANUSCRIPTS_PAGE_TITLE = '[class*=General__Heading-sc]'
const EVALUATION_BUTTON = '[href*=evaluation]'
const CONTROL_BUTTON = '[href*=control]'
const CREATED_CARET = 'Carets__Caret'
const AUTHOR_FIELD = 'UserCombo__Primary'
const STATUS_FIELD = 'Badge__Status'
const TABLE_HEADER = '[class*=Table__Header]'
const MANUSCRIPTS_TABLE_HEAD = '[class*=Table__Header] > tr >th'
const ARTICLE_TITLE = '[class*=Table__Row]>td:nth-child(1)'
const ARTICLE_LABEL = 'style__StyledTableLabel'
const ARTICLE_TOPIC = '[class*=Table__Cell] > [title]'
const TABLE_ROW = 'Table__Row'
const TABLE_CELL = 'Table__Cell'
const LABEL = 'style__StyledTableLabel'

const ARTICLE_CHECKBOX = '[class*=Table__Cell] label > [type*=checkbox]'

const SELECT_ALL_CHECKBOX = '[type=checkbox]'
const NUMBER_OF_ARTICLES_SELECTED = 'style__SelectedManuscriptsNumber'
const EDITOR_NAME_CELL = 'style__StyledAuthor'
const TOOLTIP_ICON = 'style__InfoIcon'
const TOOLTIP_TEXT = 'rc-tooltip-inner'
const ARTICLES_COUNT = '[class*=Pagination] > strong'
const PAGINATION_PAGE_BUTTON = 'Page '
const CONFIRMATION_MESSAGE = '[class*=BulkDeleteModalContainer] > p'
const IMPORT_CONFIRMATION_POPUP = '[class*=Toastify] > [role=alert]'
const CONTROL = '[href*=decision]'
const DROPDOWN_OPTION_LIST = '[class*=MenuList] > [id*=option]'
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
  getRefreshButton() {
    return cy.get(BUTTON).contains('Refresh')
  },
  clickRefreshButton() {
    this.getRefreshButton().click()
  },
  getLiveChatButton() {
    return cy.get(LIVE_CHAT_BUTTON)
  },
  clickLiveChatButton() {
    this.getLiveChatButton().click()
  },
  getManuscriptsPageTitle() {
    return cy.get(MANUSCRIPTS_PAGE_TITLE)
  },
  getEvaluationButton() {
    return cy.get(EVALUATION_BUTTON)
  },
  getNthEvaluationButton(nth) {
    return cy.get(EVALUATION_BUTTON).eq(nth)
  },
  clickEvaluation() {
    this.getEvaluationButton().click()
  },
  clickEvaluationAndVerifyUrl() {
    this.clickEvaluation()
    cy.url({ timeout: 10000 }).should('contain', evaluate)
  },
  clickEvaluationNth(nth) {
    this.getNthEvaluationButton(nth).click()
  },
  clickEvaluationNthAndVerifyUrl(nth) {
    this.clickEvaluationNth(nth)
    cy.awaitDisappearSpinner()
    cy.url({ timeout: 10000 }).should('contain', evaluate)
  },
  getControlButton() {
    return cy.get(CONTROL_BUTTON)
  },
  getControl() {
    return cy.get(CONTROL)
  },
  clickControl() {
    this.getControl().click()
  },
  clickControlAndVerifyPageLoaded() {
    this.getControl().click()
    cy.awaitDisappearSpinner()
    cy.url({ timeout: 10000 }).should('contain', 'decision')
    ControlPage.getAssignSeniorEditorDropdown().should('be.visible')
  },
  clickControlNthAndVerifyPageLoaded(nth) {
    this.getControl().eq(nth).click()
    cy.awaitDisappearSpinner()
    cy.url({ timeout: 10000 }).should('contain', 'decision')
    ControlPage.getAssignSeniorEditorDropdown().should('be.visible')
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
  clickStatus(nth) {
    this.getStatusField(nth).click()
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
  clickArticleLabel(nth) {
    this.getArticleLabel().eq(nth).click()
  },
  getAllArticleTopics() {
    return cy.get(ARTICLE_TOPIC)
  },
  getArticleTopic(nth) {
    return this.getAllArticleTopics().eq(nth)
  },
  getArticleTopicWithText(text) {
    return this.getAllArticleTopics().contains(text)
  },
  getArticleTopicByRow(nth) {
    return this.getNthTableRow(nth).find(ARTICLE_TOPIC)
  },
  clickArticleTopic(nth) {
    this.getArticleTopic(nth).click()
  },
  clickArticleTopicWithText(text) {
    this.getArticleTopicWithText(text).click()
  },
  getTableRow() {
    return cy.getByContainsClass(TABLE_ROW)
  },
  getNthTableRow(nth) {
    return this.getTableRow().eq(nth)
  },
  getTableRowsCount() {
    return cy.getByContainsClass(TABLE_ROW).its('length')
  },
  getTableJournal() {
    return cy.getByContainsClass(TABLE_CELL).eq(1)
  },
  getLabelRow(nth) {
    return cy.getByContainsClass(LABEL).eq(nth)
  },
  getTableHeader() {
    return cy.get(TABLE_HEADER, { timeout: 15000 })
  },
  getAllArticleCheckboxes() {
    return cy.get(ARTICLE_CHECKBOX)
  },
  getArticleCheckbox(nth) {
    return this.getAllArticleCheckboxes().eq(nth)
  },
  clickArticleCheckbox(nth) {
    this.getArticleCheckbox(nth).click()
  },
  getAllArticleCheckboxesLength() {
    return this.getAllArticleCheckboxes().its('length')
  },
  getSelectAllCheckbox() {
    return cy.get(SELECT_ALL_CHECKBOX).eq(0)
  },
  getSelectedArticlesCount() {
    return cy.getByContainsClass(NUMBER_OF_ARTICLES_SELECTED).invoke('text')
  },
  getDeleteButton() {
    return cy.get(BUTTON).contains('Delete')
  },
  clickDelete() {
    this.getDeleteButton().click()
  },
  getConfirmButton() {
    return cy.get(BUTTON).contains('Confirm')
  },
  clickConfirm() {
    this.getConfirmButton().click()
  },
  getConfirmationMessageForBulkDelete() {
    return cy.get(CONFIRMATION_MESSAGE)
  },
  getCloseButton() {
    return cy.get(BUTTON).contains('Close')
  },
  clickClose() {
    this.getCloseButton().click()
  },
  getEditorName() {
    return cy.getByContainsClass(EDITOR_NAME_CELL)
  },
  getTooltipIcon() {
    return cy.getByContainsClass(TOOLTIP_ICON)
  },
  getTooltipText() {
    return cy.getByContainsClass(TOOLTIP_TEXT)
  },
  getNumberOfAvailableArticles() {
    return cy.get(ARTICLES_COUNT).eq(-1)
  },
  getPaginationButton(nth) {
    return cy.getByContainsAriaLabel(`${PAGINATION_PAGE_BUTTON}${nth}`)
  },
  clickPaginationButton(nth) {
    this.getPaginationButton(nth).click({ force: true })
  },
  getSelectButton() {
    return cy.get(BUTTON).contains('Select')
  },
  clickSelect() {
    this.getSelectButton().click()
  },
  getSuccessfulImportPopup() {
    return cy.get(IMPORT_CONFIRMATION_POPUP, { timeout: 600000 })
  },
  selectDropdownOption(nth) {
    return cy.get(DROPDOWN_OPTION_LIST).eq(nth).click()
  },
  selectDropdownOptionWithText(text) {
    return cy.get(DROPDOWN_OPTION_LIST).contains(text).click({ force: true })
  },
}
export default ManuscriptsPage
