/* eslint-disable jest/expect-expect */

import { seniorEditor } from '../../fixtures/role_names'
import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Editor assigning reviewers', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
    cy.request('POST', `${seedUrl}/senior_editor_assigned`)
  })

  it('can assign 3 reviewers', () => {
    // login as seniorEditor
    cy.login(seniorEditor, dashboard)
    cy.url().should('eq', `${Cypress.config().baseUrl}/journal/dashboard`)
    cy.reload()
    cy.awaitDisappearSpinner()

    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      // login as seniorEditor
      cy.login(name.role.seniorEditor, dashboard)
      cy.reload()
      DashboardPage.clickDashboardTab(2)

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000)
      DashboardPage.clickControl() // Navigate to Control Page

      // Invite all the reviewers
      cy.reload()
      name.role.reviewers.forEach((reviewer, index) => {
        ControlPage.clickInviteReviewerDropdown()
        ControlPage.inviteReviewer(reviewer)
        ControlPage.getNumberOfInvitedReviewers().should('eq', index + 1)
      })
    })

    // Go to dashboard and verify number of invited reviewer
    Menu.clickDashboard()
    cy.get('.ReviewStatusDonut__CenterLabel-sc-76zxfe-1').contains('6')
  })
})
