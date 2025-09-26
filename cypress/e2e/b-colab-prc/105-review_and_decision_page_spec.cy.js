/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-expect */

// import { beforeEach } from 'mocha'
import { dashboard, manuscripts } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewPage } from '../../page-object/review-page'

describe('review page tests', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    // Check that config variables exist
    /* eslint-disable no-unused-expressions */
    expect(restoreUrl, 'restoreUrl should be defined').to.exist
    // eslint-disable-next-line jest/valid-expect
    expect(seedUrl, 'seedUrl should be defined').to.exist

    // Reset DB
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`).then(res => {
      /* eslint-disable jest/valid-expect */
      expect(res.status).to.eq(200)
      cy.log('Bootstrap status:', res.status)
    })

    // Seed roles
    cy.request('POST', `${seedUrl}/senior_editor_assigned`).then(res => {
      /* eslint-disable jest/valid-expect */
      expect(res.status).to.eq(200)
      cy.log('SE assigned status:', res.status)
    })
  })

  beforeEach(() => {
    // Do per-test setup (like login + UI prep)
    cy.fixture('role_names').then(name => {
      cy.login(name.role.seniorEditor, dashboard)
      DashboardPage.clickDashboardTab(2)
      DashboardPage.clickControl()
      cy.contains('Team').should('exist')

      // Invite reviewers if not already invited
      name.role.reviewers.forEach((reviewer, index) => {
        ControlPage.clickInviteReviewerDropdown()
        ControlPage.inviteReviewer(reviewer)
        ControlPage.getNumberOfInvitedReviewers().should('eq', index + 1)
      })
    })
  })

  it('verifies assigned reviewers', () => {
    cy.fixture('role_names').then(name => {
      // login as seniorEditor
      // eslint-disable-next-line no-undef
      cy.login(name.role.seniorEditor, dashboard)
      DashboardPage.clickDashboardTab(2)
      DashboardPage.clickControl() // Navigate to Control Page

      // Go to dashboard and verify number of invited reviewer
      Menu.clickDashboard()
      cy.get('.ReviewStatusDonut__CenterLabel-sc-76zxfe-1').contains('6')
    })
  })

  it('saved decision should be visible for the reviewer', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    Menu.clickManuscriptsAndAssertPageLoad()
    cy.submitDecision('the article is ok', 'revise')

    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[4], dashboard)
    })
    DashboardPage.clickDashboardTab(1)
    DashboardPage.clickAcceptReviewButton()
    cy.contains('button', 'Do Review').should('be.visible')
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    cy.get('[class*=HiddenTabs__Tab]').contains('Decision').click()
    ReviewPage.getDecisionText().should('contain', 'the article is ok')
  })

  it('reviewer should see decision after submitting a positive review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[0], dashboard)
    })
    cy.submitReview('accept', 'everything is ok', 'great submission!')

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.submitDecision('great paper!', 'accept')

    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[0], dashboard)
    })
    cy.verifyDecision('great paper')
  })

  it('reviewer should see decision after submitting a neutral review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1], dashboard)
    })
    cy.submitReview('revise', 'everything is ok', 'paper should be revised')

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.submitDecision('please revise', 'revise')

    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[1], dashboard)
    })
    cy.verifyDecision('please revise')
  })

  it('reviewer should see decision after submitting a negative review', () => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[3], dashboard)
    })
    cy.submitReview('reject', 'everything is ok', 'not good enough')

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.submitDecision('it does not fit our standards', 'reject')
    cy.awaitDisappearSpinner()

    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers[3], dashboard)
    })
    cy.verifyDecision('it does not fit our standards')
  })
})

Cypress.Commands.add(
  'submitReview',
  (reviewType, comment, confidentialComment) => {
    DashboardPage.clickDashboardTab(1)
    DashboardPage.clickAcceptReviewButton()
    cy.contains('button', 'Do Review').should('be.visible')
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    cy.contains('div', 'Metadata').should('be.visible')

    cy.get('[class*=HiddenTabs__Tab]').contains('Review').invoke('click')
    ReviewPage.fillInReviewComment(comment)
    ReviewPage.fillInConfidentialComment(confidentialComment)

    if (reviewType === 'accept') {
      ReviewPage.clickAcceptRadioButton()
    } else if (reviewType === 'revise') {
      ReviewPage.clickReviseRadioButton()
    } else if (reviewType === 'reject') {
      ReviewPage.clickRejectRadioButton()
    }

    ReviewPage.clickSubmitButton()
    ReviewPage.clickConfirmSubmitButton()
    cy.awaitDisappearSpinner()
  },
)

Cypress.Commands.add('submitDecision', (decisionText, decisionAction) => {
  cy.awaitDisappearSpinner()
  ManuscriptsPage.selectOptionWithText('Control')
  ControlPage.clickDecisionTab(1)
  ControlPage.fillInDecision(decisionText)

  if (decisionAction === 'revise') {
    ReviewPage.clickReviseRadioButton()
  } else if (decisionAction === 'accept') {
    ReviewPage.clickAcceptRadioButton()
  } else if (decisionAction === 'reject') {
    ReviewPage.clickRejectRadioButton()
  }

  ControlPage.clickSubmit()
})

Cypress.Commands.add('verifyDecision', expectedDecisionText => {
  DashboardPage.clickCompletedReviewButton()
  cy.awaitDisappearSpinner()
  cy.get('[class*=HiddenTabs__Tab]').contains('Decision').click()
  ReviewPage.getAllSectionHeaders()
    .eq(-1)
    .should('contain', 'Decision')
    .and('be.visible')
  ReviewPage.getDecisionText().should('contain', expectedDecisionText)
})
