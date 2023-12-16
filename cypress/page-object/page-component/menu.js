/// <reference types="Cypress" />
import { DashboardPage } from '../dashboard-page'
import { UsersPage } from '../users-page'

/**
 * Page component which represents the left side menu bar,
 * which contains the Logged User, Dashboard & My profile options (for non-admin users),
 * as well as the Forms, Users, Manuscripts options for admin users.
 * These options are available on all other pages.
 */
const MENU_CONTAINER = 'menu-container'
const USER_BUTTON = 'Menu__UserItem'
const BACKGROUND = 'Menu__Root'
const MESSAGE_NOT_AUTHORISED = 'AdminPage__Root'

export const Menu = {
  getMenuContainer() {
    return cy.getByDataTestId(MENU_CONTAINER)
  },
  getDashboardButton() {
    return this.getMenuContainer().contains('Dashboard')
  },
  clickDashboard() {
    this.getDashboardButton().click()
  },
  clickDashboardAndVerifyPageLoaded() {
    this.clickDashboard()
    cy.awaitDisappearSpinner()
    DashboardPage.getHeader().should('contain', 'Dashboard')
  },
  getFormsButton() {
    return this.getMenuContainer().contains('Forms')
  },
  clickForms() {
    this.getFormsButton().click()
  },
  clickFormsAndVerifyPageLoaded() {
    this.getSettingsButton().click()
    this.getFormsButton().click()
    cy.contains('Submission').click()
    cy.awaitDisappearSpinner()
    cy.contains('Submission Form Builder').should('be.visible')
  },
  getUsersButton() {
    return this.getMenuContainer().contains('Users')
  },
  clickUsers() {
    this.getUsersButton().click()
  },
  clickUsersAndVerifyPageLoaded() {
    this.getUsersButton().click()
    cy.awaitDisappearSpinner()
    UsersPage.getTitle().should('be.visible')
  },
  getSettingsButton() {
    return this.getMenuContainer().contains('Settings')
  },
  getManuscriptsButton() {
    return this.getMenuContainer().contains('Manuscripts')
  },
  clickManuscripts() {
    this.getManuscriptsButton().click()
  },
  clickManuscriptsAndAssertPageLoad() {
    this.clickManuscripts()
    cy.awaitDisappearSpinner()
  },
  getReportsButton() {
    return this.getMenuContainer().contains('Reports')
  },
  clickReports() {
    this.getReportsButton().click()
  },
  getMyProfileButton() {
    return this.getMenuContainer().contains('My profile')
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
  getMessageNotAuthorisedUser() {
    return cy.getByContainsClass(MESSAGE_NOT_AUTHORISED)
  },
}
export default Menu
