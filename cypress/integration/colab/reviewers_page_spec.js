/* eslint-disable prettier/prettier */
/* eslint-disable jest/expect-expect */

import { dashboard } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewersPage } from '../../page-object/reviewers-page'

describe('reviewers', () => {
  beforeEach(() => {
    cy.task('restore', 'initialState')
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
    ReviewersPage.clickInviteReviewerDropdown()
    cy.fixture('role_names').then(name => {
      ReviewersPage.inviteReviewer(name.role.reviewers.reviewer1)
    })
  })
  it('shared checkbox is visible', () => {
    ReviewersPage.getNumberOfInvitedReviewers().should('eq', 1)
    ReviewersPage.getSharedCheckbox(0).should('be.visible')
    ReviewersPage.clickSharedCheckbox(0)
  })
})
