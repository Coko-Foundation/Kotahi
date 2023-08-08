/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Login test', () => {
  it('Can log in as admin (and logout)', () => {
    // task to restore the database as per the  dumps/commons/bootstrap.sql
    cy.task('restore', 'commons/bootstrap')
    cy.task('seed', 'new_user')
    // login as admin and validate admin is logged in
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
      // enter email
      cy.contains('Enter Email').click()
      cy.get('#enter-email').type('admin@gmail.com')
      // submit the email
      cy.contains('Next').click()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.task('createToken', name.role.admin).then(token => {
        cy.setToken(token)
        cy.visit(dashboard)
      })
      Menu.getLoggedUserButton().should('contain', name.role.admin)
      Menu.getDashboardButton().should('be.visible')
      Menu.getLoggedUserButton().should('contain', 'Group Manager')
      DashboardPage.getSectionPlaceholder(0).should(
        'contain',
        'No matching manuscripts were found',
      )
    })
  })
})
