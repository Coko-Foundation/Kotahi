/* eslint-disable jest/expect-expect */
import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { ReviewersPage } from '../../page-object/reviewers-page'
import { dashboard } from '../../support/routes'

describe('Editor assigning reviewers', () => {
  it('can assign reviewers', () => {
    // Restore Database (dumps/senior_editor_assigned.sql)
    cy.task('restore', 'commons/colab_bootstrap')
    cy.task('seed', 'senior_editor_assigned')
    cy.task('seedForms')

    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      // login as seniorEditor
      // eslint-disable-next-line no-undef
      cy.login(name.role.seniorEditor.name, dashboard)

      DashboardPage.clickControlPanel() // Navigate to Control Page
      ControlPage.waitThreeSec()
      ControlPage.clickManageReviewers()

      // Invite all the reviewers
      name.role.reviewers.forEach((reviewer, index) => {
        ReviewersPage.clickInviteReviewerDropdown()
        ReviewersPage.inviteReviewer(reviewer.username)
        ReviewersPage.getNumberOfInvitedReviewers().should('eq', index + 1)
      })

      // Go to dashboard and verify number of invited reviewer
      Menu.clickDashboard()
      DashboardPage.getInvitedReviewersButton().should('have.text', '6 invited')
    })
  })
})
