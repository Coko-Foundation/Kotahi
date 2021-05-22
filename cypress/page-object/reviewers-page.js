/// <reference types="Cypress" />
/**
 * Page object representing the page where reviewers
 * can be selected & invited to review a specific article.
 */
const SECTION_TITLE = 'General__Title'
const INVITE_REVIEWER_DROPDOWN = 'Invite reviewers'
const INVITE_REVIEWER_OPTION_LIST = 'react-select'
const SUBMIT_BUTTON = 'button[type="submit"]'
const BACK_BUTTON = 'button[type="button"]'
const INVITED_REVIEWERS = 'div[class*="Reviewers__Reviewer-"]'

// eslint-disable-next-line import/prefer-default-export
export const ReviewersPage = {
  getSectionTitleWithText(title) {
    return cy.getByContainsClass(SECTION_TITLE).contains(title)
  },
  getInviteReviewerDropdown() {
    return cy.getByContainsAreaLabel(INVITE_REVIEWER_DROPDOWN)
  },
  clickInviteReviewerDropdown() {
    this.getInviteReviewerDropdown().click({ force: true })
  },
  getInviteReviewerOptionList() {
    return cy.getByContainsId(INVITE_REVIEWER_OPTION_LIST)
  },
  selectReviewerNamed(name) {
    this.getInviteReviewerOptionList().contains(name).click()
  },
  getSubmitButton() {
    return cy.get(SUBMIT_BUTTON)
  },
  clickSubmit() {
    this.getSubmitButton().click()
  },
  getBackButton() {
    return cy.get(BACK_BUTTON)
  },
  clickBack() {
    this.getBackButton().click()
  },
  inviteReviewer(name) {
    this.clickInviteReviewerDropdown()
    this.selectReviewerNamed(name)
    this.clickSubmit()
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
}
