/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import { LoginPage } from '../../page-object/login-page'
import { manuscripts, login } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

describe('Login page tests', () => {
  it('page should display colab branding settings', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('branding_settings').then(settings => {
      cy.visit(login)

      LoginPage.getBackground().should('be.visible')
      LoginPage.getLogo().should('be.visible')
      LoginPage.getLoginButton().should('be.visible')
      // assert settings are specific to colab instance
      LoginPage.getBackground()
        .should('have.css', 'background-image')
        .and('contains', settings.colab.primaryColor)
      LoginPage.getLogo()
        .should('have.attr', 'alt')
        .and('eq', settings.colab.brandName)
      LoginPage.getLogo()
        .should('have.attr', 'src')
        .and('eq', settings.colab.logoPath)
      LoginPage.getLoginButton()
        .should('have.css', 'background-color')
        .and('contains', settings.colab.primaryColor)
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
        .and('contains', settings.colab.primaryColor)

      ManuscriptsPage.getCreatedCaret(0)
        .should('have.css', 'color')
        .and('eq', settings.colab.primaryColor)
      ManuscriptsPage.getCreatedCaret(1)
        .should('have.css', 'color')
        .and('eq', settings.colab.primaryColor)
      ManuscriptsPage.getSubmitButton()
        .should('have.css', 'background-color')
        .should('contain', settings.colab.primaryColor)
    })
  })

  it('dashboard page should be visible to the logged in user', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    Menu.getDashboardButton().should('be.visible')
  })
})
