/* eslint-disable no-unused-vars */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Upload manuscript test', () => {
  it('can upload a manuscript and some metadata', () => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.bootstrap`)

    // login as author
    cy.fixture('role_names').then(name => {
      cy.login(name.role.author, dashboard) // login as author
    })

    // Click on new submission
    DashboardPage.clickSubmissionButton()

    // Upload manuscript
    cy.get('button').contains('Submit a URL instead').click()

    // complete the submission form
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInField('submission.$title', data.newTitle, true)
      SubmissionFormPage.clickSubmitResearch()

      // Submit your form
      SubmissionFormPage.clickSubmitYourManuscript()

      // assert form exists in dashboard
      DashboardPage.getSectionTitleWithText('My Submissions')
      // the following line is added so that it gives enough time for the dom to update the title of the submission in dashboard. Only a switch between tabs.
      DashboardPage.clickDashboardTab(1)
      DashboardPage.clickDashboardTab(0)
      DashboardPage.getSubmissionTitle().should('contain', data.newTitle)
    })
  })
})
