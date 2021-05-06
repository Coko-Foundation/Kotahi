/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Login test', () => {
  it('Can log in as admin (and logout)', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState')
    cy.task('seedForms')

    // login as admin and validate admin is logedin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.task('createToken', name.role.admin).then(token => {
        cy.setToken(token)
        cy.visit(dashboard)
      })

      Menu.getLoggedUserButton().should('contain', name.role.admin)
      Menu.getDashboardButton().should('be.visible')
      Menu.getLoggedUserButton().should('contain', 'admin')

      DashboardPage.getSectionPlaceholder(0).should(
        'contain',
        'You have not submitted any manuscripts yet',
      )
    })
  })
})
