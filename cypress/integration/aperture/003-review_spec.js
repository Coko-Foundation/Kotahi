/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { ReviewPage } from '../../page-object/review-page'
import { dashboard } from '../../support/routes'

// // login as reviewer, accept and do review, leave comments and submit
const doReview = name => {
  cy.login(name, dashboard)
  // enter email
  cy.contains('Enter Email').click()
  cy.get('#enter-email').type(
    `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
  )
  // submit the email
  cy.contains('Next').click()
  cy.get('nav').contains('Dashboard').click()
  cy.visit(dashboard)
  DashboardPage.clickAcceptReview()
  DashboardPage.clickDoReview()
  ReviewPage.getReviewCommentField().type(
    `Great paper, congratulations! ${name}`,
  )
  ReviewPage.clickAccept()
  ReviewPage.clickSubmit()
  cy.get('nav').contains('Dashboard').click()
  DashboardPage.getDoReviewButton().should('contain', 'Completed')
}

describe('Completing a review', () => {
  it('accept and do a review', () => {
    cy.task('restore', 'reviewers_invited')
    cy.task('seedForms')
    cy.fixture('role_names').then(name => {
      // Reviewers
      // TODO: Uncomment next three lines
      doReview(name.role.reviewers.reviewer1)
      doReview(name.role.reviewers.reviewer2)
      doReview(name.role.reviewers.reviewer3)

      // login as seniorEditor and assert the 3 reviews are completed
      cy.login(name.role.seniorEditor.name2, dashboard)
      cy.contains('Enter Email').click()
      cy.get('#enter-email').type(
        `${name.role.seniorEditor.name2
          .toLowerCase()
          .replace(/\s+/g, '')}@example.com`,
      )
      cy.contains('Next').click()

      // Visit dashboard page to confirm reviews are complete
      cy.visit(dashboard)

      DashboardPage.getCompletedReviewsButton().should(
        'have.text',
        '3 completed',
      )
    })
  })
})
