/* eslint-disable no-unused-vars */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { ControlPage } from '../../page-object/control-page'
import { dashboard } from '../../support/routes'

describe('Upload manuscript test', () => {
  it('can upload a manuscript and some metadata', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'commons/bootstrap')
    cy.task('seedForms')

    // login as author
    cy.fixture('role_names').then(name => {
      cy.login(name.role.author, dashboard)
    })

    DashboardPage.clickSubmissionButton() // Click on new submission
    DashboardPage.getSubmissionFileUploadInput().attachFile('test-docx.docx') // Upload manuscript
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)
    // complete the submission form
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInTitle(data.title3)
      SubmissionFormPage.clickSubmitResearch()

      // Submit your form

      SubmissionFormPage.clickSubmitYourManuscript()

      // assert form exists in dashboard

      DashboardPage.getSectionTitleWithText('My Submissions')
      DashboardPage.getSubmissionTitle().should('contain', data.title3)
    })
  })

  it('senior editor can view the submission', () => {
    // task to restore the database as per the  dumps/submission_complete.sql
    cy.task('restore', 'commons/bootstrap')
    cy.task('seed', 'submission_complete')
    cy.task('seedForms')

    cy.fixture('submission_form_data').then(data => {
      cy.fixture('role_names').then(name => {
        // login as admin
        cy.login(name.role.admin, dashboard)

        // select Control on the Manuscripts page
        Menu.clickManuscripts()
        ManuscriptsPage.selectOptionWithText('Control')

        // assign seniorEditor
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)
        ControlPage.clickAssignHandlingEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)
        ControlPage.clickAssignEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)
        // assert the reviews
        ControlPage.fillInDecision(data.decision)
        ControlPage.clickAccept()
        ControlPage.clickSubmit()
      })
    })

    cy.contains('Dashboard').click()
  })
})
