/* eslint-disable jest/expect-expect */
import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { ReviewersPage } from '../../page-object/reviewers-page'
import { dashboard } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

// const login = name => {
//   cy.task('createToken', name).then(token => {
//     cy.setToken(token)
//     cy.visit('/journal/dashboard')
//   })
// }

describe('Editor assigning reviewers', () => {
  it('can assign 3 reviewers', () => {
    // task to restore the database as per the  dumps/senior_editor_assigned.sql
    cy.task('restore', 'senior_editor_assigned')
    cy.task('seedForms')

    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      // login as seniorEditor
      // eslint-disable-next-line no-undef
      cy.login(name.role.seniorEditor.name1, dashboard)

      // enter email
      cy.contains('Enter Email').click()
      cy.get('#enter-email').type('admin@gmail.com')

      // submit the email
      cy.contains('Next').click()

      // select Control on the Manuscripts page
      Menu.clickManuscripts()
      ManuscriptsPage.selectOptionWithText('Control')

      ControlPage.clickManageReviewers()

      ReviewersPage.clickInviteReviewerDropdown()
      // Invite first reviewer'Emily Clay'
      ReviewersPage.inviteReviewer(name.role.reviewers.uuid1)
      // ReviewersPage.getNumberOfInvitedReviewers().should('eq', 1)
      // 2nd 'Joane Pilger'
      // ReviewersPage.clickInviteReviewerDropdown()
      // ReviewersPage.inviteReviewer(name.role.reviewers.uuid2)
      // ReviewersPage.getInvitedReviewersList().should('have.length', 2)

      // go to dashboard and assert number of invited reviewer
      Menu.clickDashboard()

      DashboardPage.getInvitedReviewersButton().should('have.text', '1 invited')
    })

    // task to dump data in dumps/reviewers_invited.sql
    cy.task('dump', 'reviewers_invited')
  })
})
