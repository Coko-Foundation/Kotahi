/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { ReviewPage } from '../../page-object/review-page'
import { dashboard } from '../../support/routes'

const reviewDataList = [
  {
    verdict: 'accept',
    comment: 'The paper looks good to me overall!',
    radioButton: 'accept',
  },
  {
    verdict: 'accept',
    comment: 'The article has a time-lag bias',
    radioButton: 'reject',
  },
  {
    verdict: 'reject',
  },
  {
    verdict: 'accept',
  },
  {
    verdict: 'accept',
    comment: 'Please use a linear scale.',
    radioButton: 'revise',
  },
]

describe('Completing a review', () => {
  it('accept and do a review', () => {
    cy.task('restore', 'commons/bootstrap')
    cy.task('seed', 'reviewers_invited')
    cy.task('seedForms')
    cy.fixture('role_names').then(name => {
      // Reviewers
      doReview(name.role.reviewers[0], reviewDataList[0])
      doReview(name.role.reviewers[1], reviewDataList[1])
      doReview(name.role.reviewers[2], reviewDataList[2])
      doReview(name.role.reviewers[3], reviewDataList[3])
      doReview(name.role.reviewers[4], reviewDataList[4])

      // login as seniorEditor and assert the 3 reviews are completed
      cy.login(name.role.seniorEditor, dashboard)

      DashboardPage.clickDashboardTab(2)
      cy.get('[fill="#56b984"]')
        .should('be.visible')
        .trigger('mouseover', { force: true })
      cy.contains('Completed: 3')
      cy.get('[fill="#fff2cd"]').should('be.visible').trigger('mouseover')
      cy.contains('Invited: 1')
      cy.get('[fill="#d7efd4"]').should('be.visible').trigger('mouseover')
      cy.contains('Accepted: 1')

      cy.get('[fill="#c23d20"]').should('be.visible').trigger('mouseover')
      cy.contains('Declined: 1')
    })
  })
})

// login as reviewer, accept and do review, leave comments and submit
function doReview(name, reviewData) {
  cy.login(name, dashboard)
  cy.get('nav').contains('Dashboard').click()
  cy.visit(dashboard)
  DashboardPage.clickDashboardTab(1)

  // Accpet Review Request Workflow
  if (reviewData.verdict === 'accept') {
    DashboardPage.clickAcceptReviewButton()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)

    // Only do the review if there'a  comment present
    if (reviewData.comment) {
      // Do the Review
      DashboardPage.clickDoReview()
      cy.awaitDisappearSpinner()
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000)
      ReviewPage.getReviewCommentField().focus().type('comment', { delay: 200 })
      ReviewPage.getReviewCommentField().fillInput(reviewData.comment)
      if (reviewData.radioButton === 'accept')
        ReviewPage.clickAcceptRadioButton()
      if (reviewData.radioButton === 'reject')
        ReviewPage.clickRejectRadioButton()
      if (reviewData.radioButton === 'revise')
        ReviewPage.clickReviseRadioButton()

      // Submit the review
      ReviewPage.clickSubmitButton()
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500)
      ReviewPage.clickConfirmSubmitButton()

      // Verify the review got completed
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000)
      cy.get('nav').contains('Dashboard').click()
      DashboardPage.getDoReviewButton().should('contain', 'Completed')
    }
  }

  // Reject Review Request Workflow
  if (reviewData.verdict === 'reject') {
    DashboardPage.clickRejectReviewButton()
    cy.get('[role="button"]').should('contain', 'rejected')
  }
}
