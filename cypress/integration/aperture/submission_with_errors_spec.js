/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes'

describe('Submission with errors test', () => {
  it('can submit a URL and some metadata', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState')
    cy.task('seedForms')

    // login as author and attempt to submit an incomplete submission form
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.author, dashboard)

      DashboardPage.clickSubmit()

      NewSubmissionPage.clickSubmitURL()
      NewSubmissionPage.getSubmissionMessage().should(
        'contain',
        'Submission created',
      )

      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.getValidationErrorMessage(
        'Enter at least 4 characters',
      ).should('exist')
      SubmissionFormPage.fillInName(name.role.author)
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.getValidationErrorMessage(
        'Enter at least 2 characters',
      ).should('exist')
      SubmissionFormPage.fillInKeywords('some, keywords')
    })

    // Change the title so that we can look for it
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInTitle(data.newTitle)
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.clickSubmitManuscript()

      DashboardPage.getSubmissionTitle(0).should('contain', data.newTitle)
    })
  })
})
