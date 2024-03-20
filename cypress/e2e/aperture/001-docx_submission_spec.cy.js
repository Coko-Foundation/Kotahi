/* eslint-disable no-unused-vars */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes'

describe('Upload manuscript test', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('can upload a manuscript and some metadata', () => {
    // task to restore the database as per the  dumps/bootstrap.sql
    cy.task('restore', 'commons/bootstrap')
    // login as author
    cy.fixture('role_names').then(name => {
      cy.login(name.role.author, dashboard)
    })

    DashboardPage.clickSubmissionButton() // Click on new submission
    DashboardPage.getSubmissionFileUploadInput().selectFile(
      'cypress/fixtures/test-docx.docx',
      { force: true },
    ) // Upload manuscript
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)
    cy.url().should('contain', '/submit')
    // complete the submission form
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInTitle(data.title3)
      SubmissionFormPage.clickSubmitResearch()

      // Submit your form

      SubmissionFormPage.clickSubmitYourManuscript()

      // assert form exists in dashboard

      DashboardPage.getSectionTitleWithText('My submissions')
      DashboardPage.clickDashboardTab(1)
      DashboardPage.clickDashboardTab(0)
      DashboardPage.getSubmissionTitle().should('contain', data.title3)
    })
  })
})
