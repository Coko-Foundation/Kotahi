/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { manuscripts } from '../../support/routes'

describe('Dashboard page tests', () => {
  beforeEach(() => {
    // task to restore the database as per the dumps/initial_state_other.sql
    cy.task('restore', 'initial_state_other')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    Menu.clickDashboard()
  })
  it("section 'Manuscripts I'm editor of' is visible", () => {
    DashboardPage.getSectionTitleWithText("Manuscripts I'm editor of").should(
      'be.visible',
    )
  })
})
