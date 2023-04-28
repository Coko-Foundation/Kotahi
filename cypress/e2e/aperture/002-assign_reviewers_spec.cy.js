/* eslint-disable jest/expect-expect */
import { seniorEditor } from '../../fixtures/role_names'
import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
// import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Editor assigning reviewers', () => {
  before(() => {
    // Restore Database (dumps/senior_editor_assigned.sql)
    cy.task('restore', 'commons/bootstrap')
    cy.task('seed', 'senior_editor_assigned')
    cy.task('seedForms')
  })
  it('can assign 3 reviewers', () => {
    // login as seniorEditor
    cy.login(seniorEditor, dashboard)

    cy.url().should('eq', `${Cypress.config().baseUrl}/kotahi/dashboard`)
    // cy.get('[data-testid="control-panel"]').scrollIntoView()
    cy.reload()
    cy.awaitDisappearSpinner()
    // cy.contains('You have not submitted any manuscripts yet')
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      // login as seniorEditor
      // eslint-disable-next-line no-undef
      cy.login(name.role.seniorEditor, dashboard)

      DashboardPage.clickDashboardTab(2)
      DashboardPage.clickControlPanelTeam() // Navigate to Control Page

      // Invite all the reviewers
      name.role.reviewers.forEach((reviewer, index) => {
        ControlPage.clickInviteReviewerDropdown()
        ControlPage.inviteReviewer(reviewer)
        ControlPage.getNumberOfInvitedReviewers().should('eq', index + 1)
      })
    })
    // Go to dashboard and verify number of invited reviewer
    // commented out because with the new updates it is a chart and not a text, the below check is not valid
    // maybe we can add an alt atribute to the chart so we can check what info is being sent to it.
    // Menu.clickDashboard()
    // DashboardPage.getInvitedReviewersButton().should('have.text', '6 invited')
  })
})
