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
const USER_BUTTON = 'menuStyleds__UserItem'
const BACKGROUND = 'menuStyleds__MainNavWrapper'
const MESSAGE_NOT_AUTHORISED = 'AdminPage__Root'

export const Menu = {
  getMenuContainer() {
    return cy.getByDataTestId(MENU_CONTAINER)
  },
  getDashboardButton() {
    return cy.getByDataTestId('menu-Dashboard')
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
    return cy.getByDataTestId('menu-Forms')
  },
  clickForms() {
    this.getFormsButton().click()
  },
  clickFormsAndVerifyPageLoaded() {
    this.getSettingsButton().click()
    this.clickForms()
    cy.getByDataTestId('menu-Submission').click()
    cy.awaitDisappearSpinner()
    cy.contains('Submission Form Builder').should('be.visible')
  },
  getUsersButton() {
    return cy.getByDataTestId('menu-Users')
  },
  clickUsers() {
    this.getUsersButton().click()
  },
  clickUsersAndVerifyPageLoaded() {
    this.clickUsers()
    cy.awaitDisappearSpinner()
    UsersPage.getTitle().should('be.visible')
  },
  getSettingsButton() {
    return cy.getByDataTestId('menu-Settings')
  },
  clickSettings() {
    this.getSettingsButton().click()
  },
  getManuscriptsButton() {
    return cy.getByDataTestId('menu-Manuscripts')
  },
  clickManuscripts() {
    this.getManuscriptsButton().click()
  },
  clickManuscriptsAndAssertPageLoad() {
    this.clickManuscripts()
    cy.awaitDisappearSpinner()
  },
  getReportsButton() {
    return cy.getByDataTestId('menu-Reports')
  },
  clickReports() {
    this.getReportsButton().click()
  },
  getMyProfileButton() {
    return this.getMenuContainer().get('[title="Go to your profile"]')
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
