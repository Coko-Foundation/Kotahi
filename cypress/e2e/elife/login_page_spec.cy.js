/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import { LoginPage } from '../../page-object/login-page'
import { manuscripts, login, dashboard } from '../../support/routes2'
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
        .and('contains', settings.preprint1.primaryColor)
      LoginPage.getLogo()
        .should('have.attr', 'alt')
        .and('eq', settings.preprint1.brandName)
      LoginPage.getLogo()
        .should('have.attr', 'src')
        .and('eq', settings.preprint1.logoPath)
      LoginPage.getLoginButton()
        .should('have.css', 'background-color')
        .and('contains', settings.preprint1.secondaryColor)
    })
  })

  it('branding settings should be visible after login', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('branding_settings').then(settings => {
      // task to restore the database as per the  dumps/commons/elife_bootstrap.sql
      cy.task('restore', 'commons/elife_bootstrap')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      Menu.getBackground()
        .should('have.css', 'background')
        .and('contains', settings.preprint1.primaryColor)
      ManuscriptsPage.getSubmitButton()
        .should('have.css', 'background-color')
        .should('contain', settings.preprint1.tertiaryColor)
    })
  })

  it('dashboard page should not be visible to the logged in user', () => {
    // task to restore the database as per the  dumps/commons/elife_bootstrap.sql
    cy.task('restore', 'commons/elife_bootstrap')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    Menu.getDashboardButton().should('not.exist')
  })

  it('reports option should be visible to the admin user', () => {
    // task to restore the database as per the  dumps/commons/elife_bootstrap.sql
    cy.task('restore', 'commons/elife_bootstrap')
    // cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    Menu.getReportsButton().should('be.visible')
  })
})
