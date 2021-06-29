/// <reference types="Cypress" />
/**
 * Page object representing the third option in the left side menu,
 * where the list of users is displayed & the admin is able to delete users.
 */
const TITLE = 'General__Heading'
const USER_TABLE_ROW_LIST = 'Table__Row'
const ADMIN_COLUMN = 'td:nth-child(3)'
const DELETE_USER_BUTTON = 'button:nth-child(1)'
const MAKE_ADMIN_REVIEWER_BUTTON = 'button:nth-child(3)'

// eslint-disable-next-line import/prefer-default-export
export const UsersPage = {
  getTitle() {
    return cy.getByContainsClass(TITLE)
  },
  getUserTableRowList() {
    return cy.getByContainsClass(USER_TABLE_ROW_LIST)
  },
  getAdminStatusByRow(nth) {
    return cy.get(ADMIN_COLUMN).eq(nth)
  },
  getNthUserRow(nth) {
    return this.getUserTableRowList().eq(nth)
  },
  getDeleteButton() {
    return cy.get(DELETE_USER_BUTTON)
  },
  getMakeAdminReviewerButton() {
    return cy.get(MAKE_ADMIN_REVIEWER_BUTTON)
  },
  clickMakeReviewer(nth) {
    this.getMakeAdminReviewerButton().eq(nth).click()
  },
}
