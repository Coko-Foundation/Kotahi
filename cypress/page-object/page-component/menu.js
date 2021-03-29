/// <reference types="Cypress" />
/**
 * Page component which represents the left side menu bar,
 * which contains the Logged User, Dashboard & My profile options (for non-admin users),
 * as well as the Forms, Users, Manuscripts options for admin users.
 * These options are available on all other pages.
 */
const MENU_BUTTON = 'Menu__Item'
const USER_BUTTON = 'Menu__UserItem'
const BACKGROUND = 'Menu__Root'

export const Menu = {
  getDashboardButton() {
    return cy.getByContainsClass(MENU_BUTTON).contains('Dashboard')
  },
  clickDashboard() {
    this.getDashboardButton().click()
  },
  getFormsButton() {
    return cy.getByContainsClass(MENU_BUTTON).contains('Forms')
  },
  clickForms() {
    this.getFormsButton().click()
  },
  getUsersButton() {
    return cy.getByContainsClass(MENU_BUTTON).contains('Users')
  },
  clickUsers() {
    this.getUsersButton().click()
  },
  getManuscriptsButton() {
    return cy.getByContainsClass(MENU_BUTTON).contains('Manuscripts')
  },
  clickManuscripts() {
    this.getManuscriptsButton().click()
  },
  getMyProfileButton() {
    return cy.getByContainsClass(MENU_BUTTON).contains('My profile')
  },
  clickMyProfile() {
    this.getMyProfileButton().click()
  },
  getLoggedUserButton() {
    return cy.getByContainsClass(USER_BUTTON)
  },
  clickLoggedUser() {
    this.getLoggedUserButton().click()
  },
  getBackground() {
    return cy.getByContainsClass(BACKGROUND)
  },
}
export default Menu
