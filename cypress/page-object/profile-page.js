/// <reference types="Cypress" />
/**
 * Page object representing the last option in the left side menu,
 * containing the logout option(index 0), change profile picture option (index 1)
 * & change username option (index 2).
 */
const BUTTON = 'button'
const USERNAME_FIELD = '[class*=ChangeUsername] > input'
const EMAIL_FIELD = '[class*=ChangeEmail] > input'
const EMAIL_CHANGE_ERROR_MESSAGE = 'ChangeEmail__UpdateEmailError'

// eslint-disable-next-line import/prefer-default-export
export const ProfilePage = {
  getButtonByIndex(nth) {
    return cy.get(BUTTON).eq(nth)
  },
  clickNthButton(nth) {
    this.getButtonByIndex(nth).click()
  },
  getUsernameField() {
    return cy.get(USERNAME_FIELD)
  },
  changeUsername(username) {
    this.getUsernameField().fillInput(username)
  },
  getEmailField() {
    return cy.get(EMAIL_FIELD)
  },
  updateEmail(email) {
    this.getEmailField().fillInput(email)
  },
  getEmailChangeError() {
    return cy.getByContainsClass(EMAIL_CHANGE_ERROR_MESSAGE)
  },
}
