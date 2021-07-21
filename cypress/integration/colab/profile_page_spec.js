/* eslint-disable jest/expect-expect,jest/valid-expect-in-promise */
import {
  dashboard,
  profile,
  manuscripts,
  users,
  formBuilder,
} from '../../support/routes'
import { ProfilePage } from '../../page-object/profile-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('profile page tests', () => {
  beforeEach(() => {
    // task to restore the database as per the dumps/initial_state_other.sql
    cy.task('restore', 'initial_state_other')
    cy.task('seedForms')

    // login and attempt to access the dashboard page
    cy.fixture('role_names').then(name => {
      cy.login(name.role.tester, profile)
    })
    cy.awaitDisappearSpinner()
  })
  it('first login - users should be asked to add their email', () => {
    ProfilePage.getEmailField().should('exist').and('be.visible')
    ProfilePage.getEmailChangeError()
      .should('contain', 'Required')
      .and('be.visible')
  })
  it('first login - users should not be able to switch pages before adding email', () => {
    ProfilePage.getEmailChangeError()
      .should('contain', 'Required')
      .and('be.visible')
    cy.visit(dashboard)
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', dashboard).and('contain', profile)
    ProfilePage.getEmailChangeError()
      .should('contain', 'Required')
      .and('be.visible')
    cy.visit(manuscripts)
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', manuscripts).and('contain', profile)
    ProfilePage.getEmailChangeError()
      .should('contain', 'Required')
      .and('be.visible')
    cy.visit(users)
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', users).and('contain', profile)
    ProfilePage.getEmailChangeError()
      .should('contain', 'Required')
      .and('be.visible')
    cy.visit(formBuilder)
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', formBuilder).and('contain', profile)
    ProfilePage.getEmailChangeError()
      .should('contain', 'Required')
      .and('be.visible')
    Menu.clickDashboard()
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', dashboard).and('contain', profile)
  })
  it('first login - validate email', () => {
    ProfilePage.updateEmail('test')
    ProfilePage.clickNthButton(-1)
    ProfilePage.getEmailChangeError().should('be.visible')
    ProfilePage.getEmailChangeError().should('contain', 'invalid')
    ProfilePage.updateEmail('123')
    ProfilePage.clickNthButton(-1)
    ProfilePage.getEmailChangeError().should('be.visible')
    ProfilePage.getEmailChangeError().should('contain', 'invalid')
    ProfilePage.updateEmail('email@')
    ProfilePage.clickNthButton(-1)
    ProfilePage.getEmailChangeError().should('be.visible')
    ProfilePage.getEmailChangeError().should('contain', 'invalid')
  })
  it('first login - after adding email user can navigate away', () => {
    ProfilePage.updateEmail('test@email.com')
    ProfilePage.clickNthButton(-1)
    ProfilePage.getEmailChangeError().should('not.exist')
    cy.visit(dashboard)
    cy.awaitDisappearSpinner()
    DashboardPage.getHeader().should('be.visible')
    Menu.clickFormsAndVerifyPageLoaded()
    Menu.clickUsersAndVerifyPageLoaded()
    Menu.clickManuscriptsAndAssertPageLoad()
  })
})
