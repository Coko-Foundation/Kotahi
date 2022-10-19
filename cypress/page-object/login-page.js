/// <reference types="Cypress" />
/**
 * Page object representing the login page, which contains the
 * login button & the logo. Clicking the login button redirects
 * to the ORCID login page & after the user successfully logs in, the page redirects
 * to the app.
 */
const LOGIN_BUTTON = '.sc-bkzZxe'
const LOGO = 'img'
const LOGIN_BACKGROUND = 'Login__Container'

export const LoginPage = {
  getLoginButton() {
    return cy.get(LOGIN_BUTTON)
  },
  clickLogin() {
    this.getLoginButton().click()
  },
  getLogo() {
    return cy.get(LOGO)
  },
  getBackground() {
    return cy.getByContainsClass(LOGIN_BACKGROUND)
  },
}
export default LoginPage
