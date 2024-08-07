/* eslint-disable jest/expect-expect */
import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes1'

describe('Editor assigning reviewers', () => {
  it('can assign reviewers', () => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)
    cy.request('POST', `${seedUrl}/senior_editor_assigned`)

    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      // login as seniorEditor
      // eslint-disable-next-line no-undef
      cy.login(name.role.seniorEditor, dashboard)
      DashboardPage.clickDashboardTab(2)
      DashboardPage.clickControl() // Navigate to Control Page
      ControlPage.waitThreeSec()

      // Invite all the reviewers
      name.role.reviewers.forEach((reviewer, index) => {
        ControlPage.clickInviteReviewerDropdown()
        ControlPage.inviteReviewer(reviewer)
        ControlPage.getNumberOfInvitedReviewers().should('eq', index + 1)
      })

      // Go to dashboard and verify number of invited reviewer
      Menu.clickDashboard()
      // DashboardPage.getInvitedReviewersButton().should('have.text', '6 invited')// this function doesn't work because the change of visuals
      cy.get('.ReviewStatusDonut__CenterLabel-sc-76zxfe-1').contains('6')
    })
  })
})
