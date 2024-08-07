/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { manuscripts } from '../../support/routes'

describe.skip('Dashboard page tests', () => {
  beforeEach(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedFormsUrl = Cypress.config('seedFormsUrl')

    cy.request('POST', `${restoreUrl}/initial_state_other`)
    cy.request('POST', seedFormsUrl)

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    Menu.clickDashboard()
  })
  it("section 'Editing Queue' is visible", () => {
    DashboardPage.getSectionTitleWithText('Editing Queue').should('be.visible')
  })
})
