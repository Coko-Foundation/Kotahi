/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { ReviewPage } from '../../page-object/review-page'
import { dashboard } from '../../support/routes'

const reviewDataList = [
  {
    verdict: 'accept',
    comment:
      'The paper looks good to me overall! I appreciate the meticulous presentation of data.',
    radioButton: 'accept',
  },
  {
    verdict: 'accept',
    comment:
      'Disparity of the time-frame for negative and positive trial is too high. The article has a time-lag bias',
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
    comment: 'Please use a linear scale instead of a logarithmic one.',
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
      doReview(name.role.reviewers[0].name, reviewDataList[0])
      doReview(name.role.reviewers[1].name, reviewDataList[1])
      doReview(name.role.reviewers[2].name, reviewDataList[2])
      doReview(name.role.reviewers[3].name, reviewDataList[3])
      doReview(name.role.reviewers[4].name, reviewDataList[4])

      // login as seniorEditor and assert the 3 reviews are completed
      cy.login(name.role.seniorEditor.name, dashboard)

      DashboardPage.getInvitedReviewsStatus().should('have.text', '1 invited')
      DashboardPage.getAcceptedReviewStatus().should('have.text', '1 accepted')
      DashboardPage.getCompletedReviewsStatus().should(
        'have.text',
        '3 completed',
      )
      DashboardPage.getRejectedReviewsStatus().should('have.text', '1 rejected')
    })
  })
})

// login as reviewer, accept and do review, leave comments and submit
function doReview(name, reviewData) {
  cy.login(name, dashboard)
  cy.get('nav').contains('Dashboard').click()
  cy.visit(dashboard)

  // Accpet Review Request Workflow
  if (reviewData.verdict === 'accept') {
    DashboardPage.clickAcceptReviewButton()

    // Only do the review if there'a  comment present
    if (reviewData.comment) {
      // Do the Review
      DashboardPage.clickDoReview()
      ReviewPage.getReviewCommentField().type(reviewData.comment)
      if (reviewData.radioButton === 'accept')
        ReviewPage.clickAcceptRadioButton()
      if (reviewData.radioButton === 'reject')
        ReviewPage.clickRejectRadioButton()
      if (reviewData.radioButton === 'revise')
        ReviewPage.clickReviseRadioButton()

      // Submit the review
      ReviewPage.clickSubmitButton()
      ReviewPage.clickConfirmSubmitButton()

      // Verify the review got completed
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

