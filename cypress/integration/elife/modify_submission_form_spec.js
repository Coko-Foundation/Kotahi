/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes'

const invalidDoiLnk = 'https://hours.com'
describe('validating doi field in submission form', () => {
  it('check doi link is available in submission form', () => {
    cy.task('restore', 'commons/elife_bootstrap')
    cy.task('seed', 'submission_complete') // task to restore the database as per the  dumps/submission_complete.sql
    cy.task('seedForms')
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('submission_form_data').then(data => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        // login as admin
        cy.login(name.role.admin, dashboard)

        // select Control on the Manuscripts page
        Menu.clickManuscripts()
        ManuscriptsPage.selectOptionWithText('Evaluation')
        SubmissionFormPage.fillInArticleld(data.articleId)
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInArticleUrl(data.doi)
        SubmissionFormPage.fillInBioRxivArticleUrl(data.articleId)
        SubmissionFormPage.fillInDescription(data.description)
        SubmissionFormPage.clickSubmitResearch()

        // check for the submission form contains doi
        ManuscriptsPage.selectOptionWithText('Evaluation')
        SubmissionFormPage.getDoiFiled().should('have.value', data.doi)
      })
    })
  })

  it('error message is available for incorrect doi link', () => {
    cy.task('restore', 'commons/elife_bootstrap')
    cy.task('seed', 'submission_complete') // task to restore the database as per the  dumps/submission_complete.sql
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.task('seedForms')
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      // login as admin
      cy.login(name.role.admin, dashboard)

      // select Control on the Manuscripts page
      Menu.clickManuscripts()
      ManuscriptsPage.selectOptionWithText('Evaluation')
      SubmissionFormPage.fillInDoi(invalidDoiLnk)
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.getValidationErrorMessage('DOI is invalid')
    })
  })
})
