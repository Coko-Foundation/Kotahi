/// <reference types="Cypress" />
import { DashboardPage } from '../dashboard-page'
import { UsersPage } from '../users-page'

/* eslint-disable cypress/no-unnecessary-waiting */

/**
 * Page component which represents the left side menu bar,
 * which contains the Logged User, Dashboard & My profile options (for non-admin users),
 * as well as the Forms, Users, Manuscripts options for admin users.
 * These options are available on all other pages.
 */
const MENU_CONTAINER = 'menu-container'
const MESSAGE_NOT_AUTHORISED = 'AdminPage__Root'

export const Menu = {
  getMenuContainer() {
    return cy.getByDataTestId(MENU_CONTAINER)
  },
  getDashboardButton() {
    return cy.getByDataTestId('menu-link-dashboard')
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
    return cy.getByDataTestId('menu-link-forms')
  },
  clickForms() {
    this.getFormsButton().click()
  },
  clickFormsAndVerifyPageLoaded() {
    this.getSettingsButton().click()
    this.clickForms()
    cy.getByDataTestId('menu-link-forms').click()
    cy.getByDataTestId('card-link-submission').click()
    cy.awaitDisappearSpinner()
    cy.contains('Submission Form Builder').should('be.visible')
  },
  getUsersButton() {
    return cy.getByDataTestId('menu-link-users')
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
    return cy.getByDataTestId('menu-link-configuration')
  },
  clickSettings() {
    this.getSettingsButton().click({ force: true })
  },
  getManuscriptsButton() {
    return cy.getByDataTestId('menu-link-manuscripts').should('be.visible')
  },
  assertManuscriptsButtonDoesNotExist() {
    return cy.getByDataTestId('menu-link-manuscripts').should('not.exist')
  },
  clickManuscripts() {
    this.getManuscriptsButton().click()
  },
  clickManuscriptsAndAssertPageLoad() {
    cy.wait(500)
    this.clickManuscripts()
    // cy.awaitDisappearSpinner()
    cy.url().should('contain', 'manuscripts')
  },
  getReportsButton() {
    return cy.get('[data-testid=menu-link-reports]', { timeout: 10000 })
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
    return cy.getByDataTestId('menu-user-section')
  },
  clickLoggedUser() {
    this.getLoggedUserButton().click()
  },
  getBackground() {
    return cy.getByDataTestId('menu-nav')
  },
  getMessageNotAuthorisedUser() {
    return cy.getByContainsClass(MESSAGE_NOT_AUTHORISED)
  },
}
export default Menu
