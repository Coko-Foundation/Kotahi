/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

describe('Login page tests', () => {
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

      Menu.getBackground()
        .should('have.css', 'background')
        .and('contains', settings.ncrc.primaryColor)

      ManuscriptsPage.getCreatedCaret(0)
        .should('have.css', 'color')
        .and('eq', settings.ncrc.primaryColor)
      ManuscriptsPage.getCreatedCaret(1)
        .should('have.css', 'color')
        .and('eq', settings.ncrc.primaryColor)
      ManuscriptsPage.getSubmitButton()
        .should('have.css', 'background')
        .should('contain', settings.ncrc.primaryColor)
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

    Menu.getDashboardButton().should('be.visible')
  })
})
