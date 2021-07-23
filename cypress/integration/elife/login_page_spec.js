/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import { LoginPage } from '../../page-object/login-page'
import { manuscripts, login, dashboard } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

describe('Login page tests', () => {
  it('page should display eLife branding settings', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('branding_settings').then(settings => {
      cy.visit(login)

      LoginPage.getBackground().should('be.visible')
      LoginPage.getLogo().should('be.visible')
      LoginPage.getLoginButton().should('be.visible')
      // assert settings are specific to eLife instance
      LoginPage.getBackground()
        .should('have.css', 'background-image')
        .and('contains', settings.elife.primaryColor)
      LoginPage.getLogo()
        .should('have.attr', 'alt')
        .and('eq', settings.elife.brandName)
      LoginPage.getLogo()
        .should('have.attr', 'src')
        .and('eq', settings.elife.logoPath)
      LoginPage.getLoginButton()
        .should('have.css', 'background-color')
        .and('contains', settings.elife.primaryColor)
    })
  })

  it('branding settings should be visible after login', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('branding_settings').then(settings => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')
      cy.task('seedForms')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      Menu.getBackground()
        .should('have.css', 'background-image')
        .and('contains', settings.elife.primaryColor)

      ManuscriptsPage.getCreatedCaret(0)
        .should('have.css', 'color')
        .and('eq', settings.elife.primaryColor)
      ManuscriptsPage.getCreatedCaret(1)
        .should('have.css', 'color')
        .and('eq', settings.elife.primaryColor)
      ManuscriptsPage.getSubmitButton()
        .should('have.css', 'background-color')
        .should('contain', settings.elife.primaryColor)
    })
  })

  it('dashboard page should not be visible to the logged in user', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    Menu.getDashboardButton().should('not.exist')
  })

  it('reports option should be visible to the admin user', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initial_state_other')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    Menu.getReportsButton().should('be.visible')
  })
})
