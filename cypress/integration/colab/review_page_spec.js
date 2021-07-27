/* eslint-disable prettier/prettier,jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */

import { dashboard } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewersPage } from '../../page-object/reviewers-page'
import { ReviewPage } from '../../page-object/review-page'

describe('review page tests', () => {
  beforeEach(() => {
    cy.task('restore', 'initial_state_other')
    cy.task('seedForms')
    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    Menu.clickManuscriptsAndAssertPageLoad()
    ManuscriptsPage.clickControl()
    ControlPage.clickManageReviewers()
    cy.fixture('role_names').then(name => {
      ReviewersPage.inviteReviewer(name.role.reviewers.reviewer1)
    })
  })
  it('evaluation summary block should be visible to the reviewer', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers.reviewer1, dashboard)
    })
    DashboardPage.clickAcceptReview()
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    ReviewPage.getAllPageSections().should('have.length', 3)
    ReviewPage.getAllSectionHeaders()
      .eq(-1)
      .scrollIntoView()
      .should('contain', 'Evaluation Summary')
      .and('be.visible')
    ReviewPage.getDecisionText().should('be.visible')
    ReviewPage.getDecisionRecommendation().should('be.visible')
  })
  it('saved decision should be visible for the reviewer', () => {
    ReviewersPage.clickBackToControlPage()
    ControlPage.fillInDecisionComment('the article is ok')
    ControlPage.clickRevise()
    ControlPage.clickSubmit()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers.reviewer1, dashboard)
    })
    DashboardPage.clickAcceptReview()
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    ReviewPage.getDecisionText().should('contain', 'ok')
    ReviewPage.getDecisionSelectedButton().should('exist').and('be.visible')
  })
})
