/// <reference types="Cypress" />

/**
 * Page object which represents the Dashboard, which contains
 * a submission button in the top right corner,
 * My Submission section, To Review section & Manuscripts I'm editor of section.
 * Each of these sections contain their own lists (where available) of manuscripts.
 */

const BUTTON = 'button'
const HEADER = 'General__Heading'
const SECTION_TITLE = 'General__Title'
const SECTION_PLACEHOLDER = 'style__Placeholder'
const SUBMISSION_TITLE = 'VersionTitle'

/* My Submissions */
const SUBMITTED_MANUSCRIPTS = ':nth-child(2) > a'
const CREATE_NEW_VERSION_BUTTON = 'create-new-manuscript-version-button'

/* Submitted Info */
const DECISION_FIELDS = ':nth-child(1) > .General__Section-sc-1chiust-0 > div'

// 'To Review section'
const DO_REVIEW_BUTTON = 'a[href*=review]'
const ACCEPT_REVIEW_BUTTON = 'accept-review'

// 'Manuscripts I'm editor of' section
const CONTROL_PANEL_BUTTON = 'control-panel'
const MANUSCRIPT_NAV_BUTTON = '[href="/kotahi/admin/manuscripts"]'
const INVITED_REVIEWERS_BUTTON = 'invited'
const COMPLETED_REVIEWS_BUTTON = 'completed'
const ACCEPTED_AND_PUBLISHED_TITLE = 'Badge__SuccessStatus'
const VERSION_TITLE = 'VersionTitle__Root-sc'
const ARTICLE_LINK = '[class*=General__SectionRow] a[href]'

// eslint-disable-next-line import/prefer-default-export
export const DashboardPage = {
  getSubmittedManuscript() {
    return cy.get(SUBMITTED_MANUSCRIPTS)
  },
  getSubmittedManuscripts(nth) {
    return cy.get(SUBMITTED_MANUSCRIPTS).eq(nth)
  },
  clickSubmittedManuscript(nth) {
    this.getSubmittedManuscripts(nth).click()
  },
  getSubmitButton() {
    return cy.get(BUTTON).contains('New submission')
  },
  getHeader() {
    return cy.getByContainsClass(HEADER)
  },
  clickSubmit() {
    this.getSubmitButton().click()
  },
  getSectionTitleWithText(title) {
    return cy.getByContainsClass(SECTION_TITLE).contains(title)
  },
  getSubmissionTitle() {
    return cy.getByContainsClass(SUBMISSION_TITLE)
  },
  getSectionPlaceholder(nth) {
    return cy.getByContainsClass(SECTION_PLACEHOLDER).eq(nth)
  },
  getCreateNewVersionButton() {
    return cy.getByDataTestId(CREATE_NEW_VERSION_BUTTON)
  },
  clickCreateNewVersionButton() {
    this.getCreateNewVersionButton().click()
  },
  getDecisionField(nth) {
    return cy.get(DECISION_FIELDS).eq(nth)
  },
  getControlPanelButton() {
    return cy.getByDataTestId(CONTROL_PANEL_BUTTON)
  },
  clickControlPanel() {
    this.getControlPanelButton().click()
  },
  getManuscriptNavButton() {
    return cy.get(MANUSCRIPT_NAV_BUTTON)
  },
  clickManuscriptNavButton() {
    this.getManuscriptNavButton().click()
  },
  getInvitedReviewersButton() {
    return cy.getByDataTestId(INVITED_REVIEWERS_BUTTON)
  },
  clickInvitedReviewers() {
    this.getInvitedReviewersButton().click()
  },
  getAcceptReviewButton() {
    return cy.getByDataTestId(ACCEPT_REVIEW_BUTTON)
  },
  clickAcceptReview() {
    this.getAcceptReviewButton().click()
  },
  getDoReviewButton() {
    return cy.get(DO_REVIEW_BUTTON)
  },
  clickDoReview() {
    this.getDoReviewButton().click()
  },
  clickDoReviewAndVerifyPageLoaded() {
    this.getDoReviewButton().click()
    cy.awaitDisappearSpinner()
    cy.url({ timeout: 10000 }).should('contain', 'review')
  },
  getCompletedReviewsButton() {
    return cy.getByDataTestId(COMPLETED_REVIEWS_BUTTON)
  },
  getAcceptedAndPublishedButton() {
    return cy.getByContainsClass(ACCEPTED_AND_PUBLISHED_TITLE)
  },
  getVersionTitle() {
    return cy.getByContainsClass(VERSION_TITLE)
  },
  getCompletedReviewButton() {
    return cy.get(ARTICLE_LINK).contains('Completed')
  },
  clickCompletedReviewButton() {
    this.getCompletedReviewButton().click()
  },
}
