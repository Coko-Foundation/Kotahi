/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="Cypress" />
/**
 * Page object representing the page where reviewers
 * can be selected & invited to review a specific article.
 */
const SECTION_TITLE = 'General__Title'
const INVITE_REVIEWER_DROPDOWN = 'Invite reviewers'
const INVITE_REVIEWER_OPTION_LIST = 'react-select'
const SUBMIT_BUTTON = 'button[type="submit"]'
const BUTTON = 'button[type="button"]'
const INVITED_REVIEWERS = 'div[class*="Reviewers__Reviewer-"]'
const SHARED_CHECKBOX = '[name*=checkbox-shared-reviewer]'

// eslint-disable-next-line import/prefer-default-export
export const ReviewersPage = {
  getSectionTitleWithText(title) {
    return cy.getByContainsClass(SECTION_TITLE).contains(title)
  },
  getInviteReviewerDropdown() {
    return cy.getByContainsAriaLabel(INVITE_REVIEWER_DROPDOWN)
  },
  clickInviteReviewerDropdown() {
    this.getInviteReviewerDropdown().click({ force: true })
  },
  getInviteReviewerOptionList() {
    return cy.getByContainsId(INVITE_REVIEWER_OPTION_LIST)
  },
  selectReviewerNamed(uuid) {
    this.getInviteReviewerOptionList().contains(uuid).click()
  },
  getSubmitButton() {
    return cy.get(SUBMIT_BUTTON)
  },
  clickSubmit() {
    this.getSubmitButton().click()
  },
  getBackToControlPageButton() {
    return cy.get(BUTTON).contains('Back to control panel')
  },
  clickBackToControlPage() {
    this.getBackToControlPageButton().click()
  },
  inviteReviewer(name) {
    this.clickInviteReviewerDropdown()
    this.selectReviewerNamed(name)
    this.clickSubmit()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
  },
  getInvitedReviewersList() {
    return cy.get(INVITED_REVIEWERS)
  },
  getNumberOfInvitedReviewers() {
    return this.getInvitedReviewersList().its('length')
  },
  getInvitedReviewer(nth) {
    return this.getInvitedReviewersList().eq(nth)
  },
  getSharedCheckbox(nth) {
    return cy.get(SHARED_CHECKBOX).eq(nth)
  },
  clickSharedCheckbox(nth) {
    return this.getSharedCheckbox(nth).click()
  },
  waitThreeSec() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
  },
}
