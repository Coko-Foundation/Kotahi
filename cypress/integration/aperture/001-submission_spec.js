/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { ControlPage } from '../../page-object/control-page'
import { dashboard } from '../../support/routes'

describe('URL submission test', () => {
  it('can submit a URL and some metadata', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState')
    cy.task('seedForms')

    // login as author
    cy.fixture('role_names').then(name => {
      cy.login(name.role.author, dashboard)
    })

    // enter email
    cy.contains('Enter Email').click()
    cy.get('#enter-email').type('abc@gmail.com')

    // submit the email
    cy.contains('Next').click()

    cy.get('nav').contains('Dashboard').click()

    cy.visit('http://localhost:4000/kotahi/dashboard')

    // Click on new submission
    cy.get('button').contains('＋ New submission').click()

    // Click on submit URL instead
    cy.get('button').contains('Submit a URL instead').click()

    // complete the submission form

    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInUrl(0, data.doi)
      SubmissionFormPage.fillInUrl(0, data.git)
      SubmissionFormPage.fillInTitle(data.title)
      SubmissionFormPage.fillInAbstract(data.abstract)
      SubmissionFormPage.fillInFirstAuthor(data.firstAuthor)
      SubmissionFormPage.fillInOurTake(data.ourTake)
      SubmissionFormPage.fillInMainFindings(data.mainFindings)
      SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
      SubmissionFormPage.fillInLimitations(data.limitations)
      SubmissionFormPage.fillInDatePublished(data.datePublished)
      SubmissionFormPage.fillInLink(data.link)
      SubmissionFormPage.fillInKeywords(data.keywords)
      SubmissionFormPage.fillInJournal(data.journal)
      SubmissionFormPage.fillInReviewCreator(data.reviewCreator)
      SubmissionFormPage.clickSubmitResearch()

      // Submit your form

      SubmissionFormPage.clickSubmitYourManuscript()
      cy.get('button').contains('Submit your manuscript').click()

      // assert form exists in dashboard

      DashboardPage.getSectionTitleWithText('My Submissions')
      DashboardPage.getSubmissionTitle().should('contain', data.title)

      // task to dump data in dumps/submission_complete.sql

      cy.task('dump', 'submission_complete')
    })
  })

  it('senior editor can view the submission', () => {
    // task to restore the database as per the  dumps/submission_complete.sql
    cy.task('restore', 'submission_complete')
    cy.task('seedForms')

    cy.fixture('submission_form_data').then(data => {
      cy.fixture('role_names').then(name => {
        // login as admin
        cy.login(name.role.admin, dashboard)

        // enter email
        cy.contains('Enter Email').click()
        cy.get('#enter-email').type('admin@gmail.com')

        // submit the email
        cy.contains('Next').click()

        // select Control on the Manuscripts page
        Menu.clickManuscripts()

        ManuscriptsPage.selectOptionWithText('Control')

        ControlPage.getMetadataTab(2).click()
        ControlPage.getMetadataCell(3).should('contain', data.title)

        ControlPage.getWorkflowTab().click()

        // assign seniorEditor
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor.name)
        ControlPage.clickAssignHandlingEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor.name)
        ControlPage.clickAssignEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor.name)
        // assert the reviews
        ControlPage.fillInDecision(data.decision)
        ControlPage.clickAccept()
        ControlPage.clickSubmit()
        ControlPage.clickPublish()
      })
    })

    // task to dump data in dumps/senior_editor_assigned.sql
    cy.task('dump', 'senior_editor_assigned')

    cy.contains('Dashboard').click()
  })
})
