/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */

import { dashboard, manuscripts } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewPage } from '../../page-object/review-page'

describe('review page tests', () => {
  beforeEach(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    Menu.clickManuscriptsAndAssertPageLoad()
    ManuscriptsPage.selectOptionWithText('Control')
    cy.fixture('role_names').then(name => {
      ControlPage.inviteReviewer(name.role.reviewers[0])
      ControlPage.inviteReviewer(name.role.reviewers[1])
    })
  })
  it('saved decision should be visible for the reviewer', () => {
    ControlPage.clickDecisionTab(1)
    ControlPage.fillInDecision('the article is ok')
    // ReviewPage.clickRevise()
    cy.get('[class*=FormTemplate__SafeRadioGroup]').eq(1).click()
    ControlPage.clickSubmit()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[0], dashboard)
    })
    DashboardPage.clickDashboardTab(1)
    DashboardPage.clickAcceptReviewButton()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    cy.get('[class*=HiddenTabs__Tab]').contains('Decision').click()
    ReviewPage.getDecisionText().should('contain', 'the article is ok')
  })
  it('reviewer should see decision after submitting a positive review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1], dashboard)
    })
    DashboardPage.clickDashboardTab(1)
    DashboardPage.clickAcceptReviewButton()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
    cy.get('[class*=HiddenTabs__Tab]').contains('Review').invoke('click')
    ReviewPage.fillInReviewComment('everything is ok')
    ReviewPage.fillInConfidentialComment('great submission!')
    ReviewPage.clickAcceptRadioButton()
    ReviewPage.clickSubmitButton()
    ReviewPage.clickConfirmSubmitButton()
    cy.awaitDisappearSpinner()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.selectOptionWithText('Control')
    ControlPage.clickDecisionTab(1)
    ControlPage.fillInDecision('great paper!')
    // ReviewPage.clickAccept()
    cy.get('[class*=FormTemplate__SafeRadioGroup]').eq(0).click()
    ControlPage.clickSubmit()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1], dashboard)
    })
    DashboardPage.clickCompletedReviewButton()
    cy.awaitDisappearSpinner()
    cy.get('[class*=HiddenTabs__Tab]').contains('Decision').click()
    ReviewPage.getAllSectionHeaders()
      .eq(-1)
      .should('contain', 'Decision')
      .and('be.visible')
    ReviewPage.getDecisionText().should('contain', 'great paper')
  })
  it('reviewer should see decision after submitting a neutral review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1], dashboard)
    })
    DashboardPage.clickDashboardTab(1)
    DashboardPage.clickAcceptReviewButton()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
    cy.get('[class*=HiddenTabs__Tab]').contains('Review').invoke('click')
    ReviewPage.fillInReviewComment('everything is ok')
    ReviewPage.fillInConfidentialComment('paper should be revised')
    ReviewPage.clickReviseRadioButton()
    ReviewPage.clickSubmitButton()
    ReviewPage.clickConfirmSubmitButton()
    cy.awaitDisappearSpinner()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.selectOptionWithText('Control')
    ControlPage.clickDecisionTab(1)
    ControlPage.fillInDecision('please revise')
    ReviewPage.clickReviseRadioButton()
    ControlPage.clickSubmit()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1], dashboard)
    })
    DashboardPage.clickCompletedReviewButton()
    cy.awaitDisappearSpinner()
    cy.get('[class*=HiddenTabs__Tab]').contains('Decision').click()
    cy.get('h2[class]').eq(-1).should('contain', 'Decision').and('be.visible')
    ReviewPage.getDecisionText().should('contain', 'please revise')
  })
  it('reviewer should see decision after submitting a negative review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1], dashboard)
    })
    DashboardPage.clickDashboardTab(1)
    DashboardPage.clickAcceptReviewButton()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
    cy.get('[class*=HiddenTabs__Tab]').contains('Review').invoke('click')
    ReviewPage.fillInReviewComment('everything is ok')
    ReviewPage.fillInConfidentialComment('not good enough')
    ReviewPage.clickRejectRadioButton()
    ReviewPage.clickSubmitButton()
    ReviewPage.clickConfirmSubmitButton()
    cy.awaitDisappearSpinner()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.selectOptionWithText('Control')
    ControlPage.clickDecisionTab(1)
    ControlPage.fillInDecision('it does not fit our standards')
    ReviewPage.clickReviseRadioButton()
    ControlPage.clickSubmitDecisionButton()
    cy.awaitDisappearSpinner()
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1], dashboard)
    })
    DashboardPage.clickCompletedReviewButton()
    cy.awaitDisappearSpinner()
    cy.get('[class*=HiddenTabs__Tab]').contains('Decision').click()
    ReviewPage.getAllSectionHeaders()
      .eq(-1)
      .should('contain', 'Decision')
      .and('be.visible')
    ReviewPage.getDecisionText().should(
      'contain',
      'it does not fit our standards',
    )
  })
})
