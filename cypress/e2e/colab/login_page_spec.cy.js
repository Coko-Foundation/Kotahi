/* eslint-disable jest/expect-expect */
import Color from 'color'
import { Menu } from '../../page-object/page-component/menu'
import { LoginPage } from '../../page-object/login-page'
import { manuscripts, login, dashboard } from '../../support/routes1'

describe('Login page tests', () => {
  it('page should display prc branding settings', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('branding_settings').then(settings => {
      const primaryAsRgb = Color(settings.prc.primaryColor).string()

      cy.visit(login)

      LoginPage.getBackground().should('be.visible')
      LoginPage.getLogo().should('be.visible')
      LoginPage.getLoginButton().should('be.visible')
      // assert settings are specific to prc instance
      LoginPage.getBackground()
        .should('have.css', 'background-image')
        .and('contains', primaryAsRgb)
      LoginPage.getLogo()
        .should('have.attr', 'alt')
        .and('eq', settings.prc.brandName)
      LoginPage.getLogo()
        .should('have.attr', 'src')
        .and('eq', settings.prc.logoPath)
      LoginPage.getLoginButton()
        .should('have.css', 'background-color')
        .and('contains', primaryAsRgb)
    })
  })

  it('branding settings should be visible after login', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('branding_settings').then(settings => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'commons/colab_bootstrap')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      Menu.getBackground()
        .should('have.css', 'background-image')
        .and('contains', Color(settings.prc.primaryColor).string())
    })
  })

  it('dashboard page should be visible to the logged in user', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'commons/colab_bootstrap')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    Menu.getDashboardButton().should('be.visible')
  })
  it('reports option should be visible to the admin user', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'commons/colab_bootstrap')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    Menu.getReportsButton().should('be.visible')
  })
})
