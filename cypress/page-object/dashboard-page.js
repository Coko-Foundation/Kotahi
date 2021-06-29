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
// 'To Review section'
const DO_REVIEW_BUTTON = 'a[href*=review]'
const ACCEPT_REVIEW_BUTTON = 'accept-review'
// 'Manuscripts I'm editor of' section
const CONTROL_PANEL_BUTTON = 'control-panel'
const INVITED_REVIEWERS_BUTTON = 'invited'
const COMPLETED_REVIEWS_BUTTON = 'completed'
const ACCEPTED_AND_PUBLISHED_TITLE = 'Badge__SuccessStatus'
const VERSION_TITLE = 'VersionTitle__Root-sc'

// eslint-disable-next-line import/prefer-default-export
export const DashboardPage = {
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
  getSubmissionTitle(nth) {
    return cy.getByContainsClass(SUBMISSION_TITLE).eq(nth)
  },
  getSectionPlaceholder(nth) {
    return cy.getByContainsClass(SECTION_PLACEHOLDER).eq(nth)
  },
  getControlPanelButton() {
    return cy.getByDataTestId(CONTROL_PANEL_BUTTON)
  },
  clickControlPanel() {
    this.getControlPanelButton().click()
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
  getCompletedReviewsButton() {
    return cy.getByDataTestId(COMPLETED_REVIEWS_BUTTON)
  },
  getAcceptedAndPublishedButton() {
    return cy.getByContainsClass(ACCEPTED_AND_PUBLISHED_TITLE)
  },
  getVersionTitle() {
    return cy.getByContainsClass(VERSION_TITLE)
  },
}
