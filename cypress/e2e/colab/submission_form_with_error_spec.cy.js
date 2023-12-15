/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes1'
import { Menu } from '../../page-object/page-component/menu'
import { FormsPage } from '../../page-object/forms-page'

describe('Submission with errors test', () => {
  describe('Form builder', () => {
    it('views a form field', () => {
      // task to restore the database as per the  dumps/commons/bootstrap.sql
      cy.task('restore', 'commons/colab_bootstrap')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)
      })

      // enter the from page and assert the fileds
      cy.contains('Settings').click()
      Menu.clickForms()
      cy.contains('Submission').click()

      // For Submission field
      FormsPage.getFormTitleTab(0).should(
        'contain',
        'Research Object Submission Form',
      )
      FormsPage.clickFormOption(1)
      FormsPage.getFieldValidate().scrollIntoView()
      FormsPage.getFieldValidate().click()
      cy.get('[class*="MenuList"] > div').eq(0).click()
      cy.contains('Save').click()
    })

    it('can upload manuscript and some metadata', () => {
      // login as author and attempt to submit an incomplete submission form
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.author, dashboard)
      })

      Menu.clickDashboard()
      // Click on new submission
      DashboardPage.clickSubmissionButton()

      // Upload manuscript
      cy.get('input[type=file]').selectFile('cypress/fixtures/test-pdf.pdf', {
        force: true,
      })
      cy.get('[data-testid="submission.$title"]').clear()
      cy.get('[data-testid="submission.$title"]').should('have.length', 1)
      SubmissionFormPage.clickSubmitResearch()

      // Change the title so that we can look for it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInTitle(data.newTitle)
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInAbstractColab(data.abstract)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInPreprintUri(data.link)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInKeywords(data.keywords)
        SubmissionFormPage.fillInReviewCreator(data.creator)
        SubmissionFormPage.clickSubmitResearch()
        // Submit the form
        SubmissionFormPage.clickSubmitYourManuscript()
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(4000)
        // Contains new title
        DashboardPage.getSubmissionTitle(0).should('contain', data.newTitle)
      })
    })
  })
})
