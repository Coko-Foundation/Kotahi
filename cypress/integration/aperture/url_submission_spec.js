/* eslint-disable no-unused-vars */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Upload manuscript test', () => {
  it('can upload a manuscript and some metadata', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'commons/bootstrap') // Populate the Database
    cy.task('seedForms')

    // login as author
    cy.fixture('role_names').then(name => {
      cy.login(name.role.author.name, dashboard) // login as author
    })

    // Click on new submission
    DashboardPage.clickSubmissionButton() 

    // Upload manuscript
    cy.get('button').contains('Submit a URL instead').click()

    // complete the submission form
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInTitle(data.title1)
      SubmissionFormPage.clickSubmitResearch()

      // Submit your form
      SubmissionFormPage.clickSubmitYourManuscript()

      // assert form exists in dashboard
      DashboardPage.getSectionTitleWithText('My Submissions')
      DashboardPage.getSubmissionTitle().should('contain', data.title1)
    })
  })
})

