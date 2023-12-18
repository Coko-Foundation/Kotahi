/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable prettier/prettier,jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */

import { dashboard, manuscripts } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewPage } from '../../page-object/review-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'

// eslint-disable-next-line jest/no-disabled-tests
describe('control page tests', () => {
  // the commented part below is because of the issue for shared review that doesn't work as expected because of the issue #1011

  // context('shared message', () => {
  //   before(() => {
  //     cy.task('restore', 'initial_state_other')
  //     cy.task('seedForms')
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.admin, dashboard)
  //       cy.awaitDisappearSpinner()
  //       DashboardPage.clickSubmit()
  //       NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
  //       Menu.clickManuscriptsAndAssertPageLoad()
  //       ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //       ControlPage.clickAssignSeniorEditorDropdown()
  //       ControlPage.selectDropdownOptionByName(name.role.author)
  //       ControlPage.inviteReviewer(name.role.reviewers[3])
  //       ControlPage.inviteReviewer(name.role.reviewers[1])
  //       ControlPage.inviteReviewer(name.role.reviewers[4])
  //     })
  //   })
  //   it('shared message is visible', () => {
  //      // eslint-disable-next-line cypress/no-unnecessary-waiting
  //      cy.wait(500)
  //     ControlPage.clickInvitedReviewer()
  //     ControlPage.clickReviewerSharedCheckbox(0)
  //     ControlPage.clickReviewerSharedCheckbox(1)
  //     ControlPage.clickReviewerSharedCheckbox(2)
  //     ControlPage.waitThreeSec()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.reviewers[3], dashboard)
  //       cy.awaitDisappearSpinner()
  //       DashboardPage.clickAcceptReviewButton()
  //       // eslint-disable-next-line cypress/no-unnecessary-waiting
  //       cy.wait(2000)
  //       DashboardPage.clickDoReviewAndVerifyPageLoaded()
  //       cy.fixture('submission_form_data').then(data => {
  //         ReviewPage.fillInReviewComment(data.review1)
  //       })
  //       ReviewPage.clickAcceptRadioButton()
  //       ReviewPage.clickSubmitButton()
  //       ReviewPage.clickConfirmSubmitButton()
  //       ReviewPage.waitThreeSec()
  //       cy.login(name.role.author, dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     cy.contains('Enter Email').click()
  //     cy.get('#enter-email').type('emilyaccount@test.com')
  //     cy.contains('Next').click()
  //     cy.visit('/kotahi/dashboard')
  //     ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //     DashboardPage.clickControlPanel()
  //     ControlPage.clickShow()
  //     cy.fixture('submission_form_data').then(data => {
  //       ControlPage.getReviewMessage().should('contain', data.review1)
  //     })
  //   })
  //   it('shared message is not visible', () => {
  //     ControlPage.waitThreeSec()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.reviewers[1], dashboard)
  //       cy.awaitDisappearSpinner()
  //       cy.contains('Enter Email').click()
  //       cy.get('#enter-email').type('joane@test.com')
  //       cy.contains('Next').click()
  //       cy.visit('/kotahi/dashboard')
  //       DashboardPage.clickAcceptReviewButton()
  //       // eslint-disable-next-line cypress/no-unnecessary-waiting
  //       cy.wait(2000)
  //       DashboardPage.clickDoReviewAndVerifyPageLoaded()
  //       cy.fixture('submission_form_data').then(data => {
  //         ReviewPage.fillInReviewComment(data.review2)
  //       })
  //       ReviewPage.clickAcceptRadioButton()
  //       ReviewPage.clickSubmitButton()
  //       ReviewPage.clickConfirmSubmitButton()
  //       ReviewPage.waitThreeSec()
  //       cy.login(name.role.reviewers[0], dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     DashboardPage.clickControlPanel()
  //     cy.fixture('submission_form_data').then(data => {
  //       cy.get('.DecisionReview__Root-sc-1azvco7-6').should(
  //         'not.contain',
  //         data.review2,
  //       )
  //     })
  //   })

  /* commented because this is not visible yet on the reivew page" */
  //   it('checkbox can be published publicly is visible', () => {
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.admin, manuscripts)
  //     })
  //     ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //     ControlPage.clickInvitedReviewer()
  //     ControlPage.clickReviewerSharedCheckbox(0)
  //     ControlPage.waitThreeSec()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.reviewers[4], dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     DashboardPage.clickAcceptReviewButton()
  //     DashboardPage.clickDoReviewAndVerifyPageLoaded()
  //     cy.fixture('submission_form_data').then(data => {
  //       ReviewPage.fillInReviewComment(data.review1)
  //     })
  //     ReviewPage.getCanBePublishedPubliclyCheckbox()
  //       .scrollIntoView()
  //       .should('be.visible')
  //     ReviewPage.clickCanBePublishedPublicly()
  //     ReviewPage.getCanBePublishedPubliclyCheckbox().should(
  //       'have.value',
  //       'true',
  //     )
  //   })
  //   it('icon for accepted to publish review is visible', () => {
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.admin, manuscripts)
  //     })
  //     ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //     ControlPage.clickInvitedReviewer()
  //     ControlPage.clickReviewerSharedCheckbox(0)
  //     ControlPage.waitThreeSec()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.reviewers[4], dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     DashboardPage.clickAcceptReviewButton()
  //     DashboardPage.clickDoReviewAndVerifyPageLoaded()
  //     cy.fixture('submission_form_data').then(data => {
  //       ReviewPage.fillInReviewComment(data.review1)
  //     })
  //     ReviewPage.clickCanBePublishedPublicly()
  //     ReviewPage.getCanBePublishedPubliclyCheckbox().should(
  //       'have.value',
  //       'true',
  //     )
  //     ReviewPage.clickAcceptRadioButton()
  //     ReviewPage.clickSubmitButton()
  //     ReviewPage.waitThreeSec()
  //     DashboardPage.clickControlPanelDecision()
  //     ControlPage.clickShow()
  //     ControlPage.getAcceptedToPublishReview().should('be.visible')
  //   })
  // })

  // context('hide review and review name from author', () => {
  //   beforeEach(() => {
  //     cy.task('restore', 'initial_state_other')
  //     cy.task('seedForms')
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.admin, dashboard)
  //       cy.awaitDisappearSpinner()
  //       DashboardPage.clickSubmit()
  //       NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
  //       Menu.clickManuscriptsAndAssertPageLoad()
  //       ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //       ControlPage.clickAssignSeniorEditorDropdown()
  //       ControlPage.selectDropdownOptionByName(name.role.reviewers[0])
  //       ControlPage.inviteReviewer(name.role.reviewers[0])
  //       ControlPage.clickInvitedReviewer()
  //       ControlPage.clickReviewerSharedCheckbox(0)
  //       ControlPage.waitThreeSec()
  //       cy.login(name.role.reviewers[0], dashboard)
  //       cy.contains('Enter Email').click()
  //       cy.get('#enter-email').type('emilyaccount@test.com')
  //       cy.contains('Next').click()
  //       cy.visit('/kotahi/dashboard')
  //       cy.awaitDisappearSpinner()
  //       DashboardPage.clickAcceptReviewButton()
  //       cy.wait(3000)
  //       DashboardPage.clickDoReview()
  //       cy.fixture('submission_form_data').then(data => {
  //         ReviewPage.fillInReviewComment(data.review1)
  //       })
  //       ReviewPage.clickAcceptRadioButton()
  //       ReviewPage.clickSubmitButton()
  //       ReviewPage.clickConfirmSubmitButton()
  //       ReviewPage.waitThreeSec()
  //       cy.login(name.role.admin, manuscripts)
  //       cy.awaitDisappearSpinner()
  //       ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //       ControlPage.clickShow()
  //       cy.fixture('submission_form_data').then(data => {
  //         ControlPage.getReviewMessage().should('contain', data.review1)
  //       })
  //       cy.login(name.role.reviewers[0], dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     DashboardPage.clickControlPanelDecision()
  //   })
  //   it('review is hidden from the author of the article', () => {
  //     ControlPage.clickHideReviewToAuthor()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.admin, manuscripts)
  //       cy.awaitDisappearSpinner()
  //       ManuscriptsPage.clickControl()
  //       ControlPage.getNoReviewsMessage().should(
  //         'contain',
  //         'No reviews completed yet.',
  //       )
  //       ControlPage.getShowButton().should('not.exist')
  //     })
  //   })
  //     it('hide reviewer name is true, reviewer can not see their name', () => {
  //       // cy.fixture('role_names').then(name => {
  //       //   cy.login(name.role.admin, manuscripts)
  //       //   cy.awaitDisappearSpinner()
  //       //   ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //       // })
  //       // ControlPage.clickHideReviewerNameToAuthor()
  //       cy.fixture('role_names').then(name => {
  //         cy.login(name.role.reviewers[1], dashboard)
  //       })
  //       cy.get('[role="button"]').click()
  //       ControlPage.getReviewerName().should('contain', 'Anonymous')
  //     })
  //   })
  // })

  context('admin user can see the icons', () => {
    beforeEach(() => {
      cy.task('restore', 'commons/colab_bootstrap')
      cy.fixture('role_names').then(name => {
        cy.login(name.role.reviewers[0], dashboard)
        cy.awaitDisappearSpinner()
        DashboardPage.clickSubmit()
        NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
        cy.fixture('submission_form_data').then(data => {
          SubmissionFormPage.fillInDoi(data.doi)
          SubmissionFormPage.getWaxInputBox(0).fillInput(data.abstract)
          SubmissionFormPage.fillInFirstAuthor(data.creator)
          SubmissionFormPage.fillInDatePublished(data.date)
          SubmissionFormPage.fillInPreprintUri(data.doi)
          SubmissionFormPage.fillInOurTake(data.ourTake)
          SubmissionFormPage.fillInMainFindings(data.mainFindings)
          SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
          SubmissionFormPage.fillInLimitations(data.limitations)
          SubmissionFormPage.fillInKeywords(data.keywords)
          SubmissionFormPage.fillInReviewCreator(data.creator)
        })
        SubmissionFormPage.clickSubmitResearch()
        SubmissionFormPage.clickSubmitManuscriptAndWaitPageLoad()
        cy.login(name.role.admin, manuscripts)
        cy.awaitDisappearSpinner()
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.selectOptionWithText('Control')
        cy.awaitDisappearSpinner()
        ControlPage.getAssignSeniorEditorDropdown().should('be.visible')
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.reviewers[1])
        ControlPage.inviteReviewer(name.role.reviewers[1])
        ControlPage.clickInvitedReviewer()
        ControlPage.clickReviewerSharedCheckbox()
        ControlPage.waitThreeSec()
        cy.login(name.role.reviewers[1], dashboard)
        cy.awaitDisappearSpinner()
        DashboardPage.clickDashboardTab(1)
        DashboardPage.clickAcceptReviewButton()
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000)
        DashboardPage.clickDoReview()
        cy.fixture('submission_form_data').then(data => {
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(500)
          cy.get('[class*=HiddenTabs__Tab]').contains('Review').invoke('click')
          ReviewPage.fillInReviewComment(data.review1)
          ReviewPage.clickAcceptRadioButton()
          ReviewPage.clickSubmitButton()
          ReviewPage.clickConfirmSubmitButton()
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(2000)
          cy.get('[name="submission.$title"]').contains('New submission')
        })
        cy.login(name.role.admin, manuscripts)
        cy.awaitDisappearSpinner()
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.selectOptionWithText('Control')
        ControlPage.clickDecisionTab(1)
        ControlPage.clickHideReviewToAuthor()
        ControlPage.clickHideReviewerNameToAuthor()
      })
      cy.fixture('role_names').then(name => {
        cy.login(name.role.reviewers[1], dashboard)
        cy.get('[name="submission.$title"]:last').click()
        cy.get('[class*=TabsContainer]').contains('Review').click()
        ControlPage.getReviewerName().should('contain', name.role.reviewers[1])
      })
    })
    it('admin user hide review set to true, reviewer can not see their name', () => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
        cy.awaitDisappearSpinner()
        ManuscriptsPage.selectOptionWithText('Control')
        cy.awaitDisappearSpinner()
        ControlPage.getAssignSeniorEditorDropdown().should('be.visible')
      })
      ControlPage.clickDecisionTab(1)
      ControlPage.clickHideReviewToAuthor()
      ControlPage.clickHideReviewerNameToAuthor()
      cy.fixture('role_names').then(name => {
        cy.login(name.role.reviewers[1], dashboard)
        cy.get('[name="submission.$title"]:last').click()
        cy.get('[class*=TabsContainer]').contains('Review').click()
        ControlPage.getReviewerName().should(
          'not.contain',
          name.role.reviewers[1],
        )
      })
    })
  })
})
