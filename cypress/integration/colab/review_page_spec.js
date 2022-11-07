/* eslint-disable prettier/prettier,jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */

import { dashboard, manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewersPage } from '../../page-object/reviewers-page'
import { ReviewPage } from '../../page-object/review-page'

describe('review page tests', () => {
  beforeEach(() => {
    cy.task('restore', 'commons/colab_bootstrap')
    cy.task('seedForms')
    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin.name, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    Menu.clickManuscriptsAndAssertPageLoad()
    ManuscriptsPage.clickControl()
    ControlPage.clickManageReviewers()
    cy.fixture('role_names').then(name => {
      ReviewersPage.inviteReviewer(name.role.reviewers[0].username)
      ReviewersPage.inviteReviewer(name.role.reviewers[1].username)
    })
  })
  it('evaluation summary block should be visible to the reviewer', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[0].name, dashboard)
    })
    DashboardPage.clickAcceptReviewButton()
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    ReviewPage.getAllPageSections().should('have.length', 3)
    ReviewPage.getAllSectionHeaders()
      .eq(-1)
      .scrollIntoView()
      .should('contain', 'Evaluation summary')
      .and('be.visible')
    ReviewPage.getDecisionText().should('be.visible')
    ReviewPage.getDecisionRecommendation().should('be.visible')
  })
  it('saved decision should be visible for the reviewer', () => {
    ReviewersPage.clickBackToControlPage()
    ControlPage.fillInDecision('the article is ok')
    ControlPage.clickRevise()
    ControlPage.clickSubmit()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[0].name, dashboard)
    })
    DashboardPage.clickAcceptReviewButton()
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    ReviewPage.getDecisionText().should('contain', 'ok')
  })
  it('reviewer should see decision after submitting a positive review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1].name, dashboard)
    })
    DashboardPage.clickAcceptReviewButton()
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    ReviewPage.fillInReviewComment('everything is ok')
    ReviewPage.fillInConfidentialComment('great submission!')
    ReviewPage.clickAcceptRadioButton()
    ReviewPage.clickSubmitButton()
    ReviewPage.clickConfirmSubmitButton()
    cy.awaitDisappearSpinner()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin.name, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.clickControl()
    ControlPage.fillInDecision('great paper!')
    ControlPage.clickAccept()
    ControlPage.clickSubmit()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1].name, dashboard)
    })
    DashboardPage.clickCompletedReviewButton()
    cy.awaitDisappearSpinner()
    ReviewPage.getAllSectionHeaders()
      .eq(-1)
      .scrollIntoView()
      .should('contain', 'Evaluation summary')
      .and('be.visible')
    ReviewPage.getDecisionText().should('contain', 'great paper')
  })
  it('reviewer should see decision after submitting a neutral review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1].name, dashboard)
    })
    DashboardPage.clickAcceptReviewButton()
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    ReviewPage.fillInReviewComment('everything is ok')
    ReviewPage.fillInConfidentialComment('paper should be revised')
    ReviewPage.clickReviseRadioButton()
    ReviewPage.clickSubmitButton()
    ReviewPage.clickConfirmSubmitButton()
    cy.awaitDisappearSpinner()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin.name, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.clickControl()
    ControlPage.fillInDecision('please revise')
    ControlPage.clickRevise()
    ControlPage.clickSubmit()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1].name, dashboard)
    })
    DashboardPage.clickCompletedReviewButton()
    cy.awaitDisappearSpinner()
    ReviewPage.getAllSectionHeaders()
      .eq(-1)
      .scrollIntoView()
      .should('contain', 'Evaluation summary')
      .and('be.visible')
    ReviewPage.getDecisionText().should('contain', 'please revise')
  })
  it('reviewer should see decision after submitting a negative review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1].name, dashboard)
    })
    DashboardPage.clickAcceptReviewButton()
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    ReviewPage.fillInReviewComment('everything is ok')
    ReviewPage.fillInConfidentialComment('not good enough')
    ReviewPage.clickRejectRadioButton()
    ReviewPage.clickSubmitButton()
    ReviewPage.clickConfirmSubmitButton()
    cy.awaitDisappearSpinner()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin.name, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.clickControl()
    ControlPage.fillInDecision('it does not fit our standards')
    ControlPage.clickReject()
    ControlPage.clickSubmit()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1].name, dashboard)
    })
    DashboardPage.clickCompletedReviewButton()
    cy.awaitDisappearSpinner()
    ReviewPage.getAllSectionHeaders()
      .eq(-1)
      .scrollIntoView()
      .should('contain', 'Evaluation summary')
      .and('be.visible')
    ReviewPage.getDecisionText().should(
      'contain',
      'it does not fit our standards',
    )
  })
})
