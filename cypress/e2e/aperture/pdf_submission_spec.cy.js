/* eslint-disable no-unused-vars */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes'

describe('Upload manuscript test', () => {
  it('can upload a manuscript and some metadata', () => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.bootstrap`)

    cy.fixture('role_names').then(name => {
      cy.login(name.role.author, dashboard) // login as author
    })

    DashboardPage.clickSubmissionButton() // Click on new submission
    DashboardPage.getSubmissionFileUploadInput().selectFile(
      'cypress/fixtures/test-pdf.pdf',
      { force: true },
    ) // Upload manuscript

    cy.fixture('submission_form_data').then(data => {
      // Fill Submission Form
      SubmissionFormPage.fillInField('submission.$title', data.title, true)
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.clickSubmitYourManuscript() // Submit your form

      // assert form exists in dashboard
      DashboardPage.getSectionTitleWithText('My Submissions')
      // the following line is added so that it gives enough time for the dom to update the title of the submission in dashboard.
      DashboardPage.clickDashboardTab(1)
      DashboardPage.clickDashboardTab(0)
      DashboardPage.getSubmissionTitle().should('contain', data.title)
    })
  })
})
