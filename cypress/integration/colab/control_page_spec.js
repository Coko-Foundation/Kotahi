/* eslint-disable prettier/prettier */
/* eslint-disable jest/expect-expect */

import { dashboard, manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewersPage } from '../../page-object/reviewers-page'
import { ReviewPage } from '../../page-object/review-page'

describe('review page', () => {
    context('shared message', () => {
        beforeEach(() => {
            cy.task('restore', 'initialState')
            cy.task('seedForms')
            // eslint-disable-next-line jest/valid-expect-in-promise
            cy.fixture('role_names').then(name => {
                cy.login(name.role.admin, dashboard)
            })
            cy.awaitDisappearSpinner()
            DashboardPage.clickSubmit()
            NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
            Menu.clickManuscriptsAndAssertPageLoad()
            ManuscriptsPage.clickControAndVerifyPageLoaded()
            ControlPage.getAssignEditor(0).click()
            cy.fixture('role_names').then(name => {
                ControlPage.selectEditorByName(name.role.reviewers.reviewer1)
                ControlPage.clickManageReviewers()
                ReviewersPage.inviteReviewer(name.role.reviewers.reviewer1)
            })
        })
        it('shared message is visible', () => {
            ReviewersPage.clickSharedCheckbox(0)
            ReviewersPage.waitThreeSec()
            ReviewersPage.clickBackToControlPage()
            // eslint-disable-next-line jest/valid-expect-in-promise
            cy.fixture('role_names').then(name => {
                cy.login(name.role.reviewers.reviewer1, dashboard)
                cy.awaitDisappearSpinner()
                DashboardPage.clickAcceptReview()
                DashboardPage.clickDoReviewAndVerifyPageLoaded()
                // eslint-disable-next-line jest/valid-expect-in-promise
                cy.fixture("submission_form_data").then(data => {
                    ReviewPage.fillInReviewComment(data.review1)
                })
                ReviewPage.clickAccept()
                ReviewPage.clickSubmit()
                ReviewPage.waitThreeSec()
                cy.login(name.role.admin, manuscripts)
                cy.awaitDisappearSpinner()
                ManuscriptsPage.clickControAndVerifyPageLoaded()
                ControlPage.clickShow()
                // eslint-disable-next-line jest/valid-expect-in-promise
                cy.fixture("submission_form_data").then(data => {
                    ControlPage.getReviewMessage().should('contain', data.review1)
                })
            })
        })
        it('shared message is not visible', () => {
            ReviewersPage.clickBackToControlPage()
            ReviewersPage.waitThreeSec()
            // eslint-disable-next-line jest/valid-expect-in-promise
            cy.fixture('role_names').then(name => {
                cy.login(name.role.reviewers.reviewer1, dashboard)
                cy.awaitDisappearSpinner()
                DashboardPage.clickAcceptReview()
                DashboardPage.clickDoReviewAndVerifyPageLoaded()
                // eslint-disable-next-line jest/valid-expect-in-promise
                cy.fixture("submission_form_data").then(data => {
                    ReviewPage.fillInReviewComment(data.review1)
                })
                ReviewPage.clickAccept()
                ReviewPage.clickSubmit()
                ReviewPage.waitThreeSec()
                cy.login(name.role.admin, manuscripts)
                cy.awaitDisappearSpinner()
                ManuscriptsPage.clickControAndVerifyPageLoaded()
                ControlPage.getShowButton().should('not.exist')
            })
        })
    })
    context('hide review and review name from author', () => {
        beforeEach(() => {
            cy.task('restore', 'initialState')
            cy.task('seedForms')
            // eslint-disable-next-line jest/valid-expect-in-promise
            cy.fixture('role_names').then(name => {
                cy.login(name.role.admin, dashboard)
            })
            cy.awaitDisappearSpinner()
            DashboardPage.clickSubmit()
            NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
            Menu.clickManuscriptsAndAssertPageLoad()
            ManuscriptsPage.clickControAndVerifyPageLoaded()
            ControlPage.getAssignEditor(0).click()
            cy.fixture('role_names').then(name => {
                ControlPage.selectEditorByName(name.role.reviewers.reviewer1)
                ControlPage.clickManageReviewers()
                ReviewersPage.inviteReviewer(name.role.reviewers.reviewer1)
                ReviewersPage.clickSharedCheckbox(0)
                ReviewersPage.waitThreeSec()
                cy.login(name.role.reviewers.reviewer1, dashboard)
                cy.awaitDisappearSpinner()
                DashboardPage.clickAcceptReview()
                DashboardPage.clickDoReview()
                cy.fixture("submission_form_data").then(data => {
                    ReviewPage.fillInReviewComment(data.review1)
                })
                ReviewPage.clickAccept()
                ReviewPage.clickSubmit()
                ReviewPage.waitThreeSec()
                cy.login(name.role.admin, manuscripts)
                cy.awaitDisappearSpinner()
                ManuscriptsPage.clickControAndVerifyPageLoaded()
                ControlPage.clickShow()
                cy.fixture("submission_form_data").then(data => {
                    ControlPage.getReviewMessage().should('contain', data.review1)
                })
                cy.login(name.role.reviewers.reviewer1, dashboard)
                cy.awaitDisappearSpinner()
                DashboardPage.clickControlPanel()
            })
        })
        it('review is hidden from the author of the article', () => {
            ControlPage.clickHideReviewToAuthor()
            // eslint-disable-next-line jest/valid-expect-in-promise
            cy.fixture('role_names').then(name => {
                cy.login(name.role.admin, manuscripts)
                cy.awaitDisappearSpinner()
                ManuscriptsPage.clickControl()
                ControlPage.getNoReviewsMessage().should('contain', 'No reviews completed yet.')
                ControlPage.getShowButton().should('not.exist')
            })
        })
        it('hide reviewer name', () => {
            ControlPage.clickHideReviewerNameToAuthor()
            // eslint-disable-next-line jest/valid-expect-in-promise
            cy.fixture('role_names').then(name => {
                cy.login(name.role.admin, manuscripts)
                cy.awaitDisappearSpinner()
                ManuscriptsPage.clickControAndVerifyPageLoaded()
                ControlPage.clickShow()
                ControlPage.getReviewerName().should('contain', 'Anonymous')
            })
        })
    })
})