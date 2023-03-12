/* eslint-disable jest/expect-expect */
import { seniorEditor, reviewers } from '../../fixtures/role_names'
import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { ReviewersPage } from '../../page-object/reviewers-page'
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
    cy.get('[data-testid="control-panel"]').then($h2 => {
      cy.log($h2.text())
    })
    cy.get('html').invoke('attr', 'style', 'scroll-behavior: inherit')
    DashboardPage.clickControlPanel() // Navigate to Control Page
    ControlPage.clickManageReviewers()

    // Invite all the reviewers
    reviewers.forEach((reviewer, index) => {
      ReviewersPage.clickInviteReviewerDropdown()
      ReviewersPage.inviteReviewer(reviewer)
      ReviewersPage.getNumberOfInvitedReviewers().should('eq', index + 1)
    })
    // Go to dashboard and verify number of invited reviewer
    Menu.clickDashboard()
    DashboardPage.getInvitedReviewersButton().should('have.text', '6 invited')
  })
})
