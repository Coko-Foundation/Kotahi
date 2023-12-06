/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { manuscripts, dashboard } from '../../support/routes2'

const invalidDoiLnk = 'https://hours.com'
describe('validating doi field in submission form', () => {
  context('check the Submission form based on form builder', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'commons/elife_bootstrap')
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      ManuscriptsPage.getTableHead().should('be.visible')
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoadElife()
    })

    // check if the form contain all the columns
    it('check if the form contain all the columns', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const formElements = [
          data.preprint1.articleId,
          data.preprint1.articleUrl,
          data.preprint1.bioRxivArticleUrl,
          data.preprint1.description,
          data.preprint1.review1,
          data.preprint1.review1Creator,
          data.preprint1.review1Date,
          data.preprint1.review2,
          data.preprint1.review2Creator,
          data.preprint1.review2Date,
          data.preprint1.review3,
          data.preprint1.review3Creator,
          data.preprint1.review3Date,
          data.preprint1.summary,
          data.preprint1.summaryCreator,
          data.preprint1.summaryDate,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 16; i++) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            formElements[i],
          )
        }
      })
    })

    // check if it is displayed the required message
    it('check required message', () => {
      SubmissionFormPage.clickSubmitResearch()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 4; i++) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            data.required,
          )
        }
      })
    })
  })

  context('DOI validations', () => {
    it('check doi link is available in submission form', () => {
      cy.task('restore', 'commons/elife_bootstrap')
      cy.task('seed', 'submission_complete') // task to restore the database as per the  dumps/submission_complete.sql
      // cy.task('seedForms')
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        // eslint-disable-next-line jest/valid-expect-in-promise
        cy.fixture('role_names').then(name => {
          // login as admin
          cy.login(name.role.admin, dashboard)

          // select Control on the Manuscripts page
          Menu.clickManuscripts()
          ManuscriptsPage.getOptionsElifeText('Evaluation').click()
          SubmissionFormPage.fillInArticleld(data.articleId)
          SubmissionFormPage.fillInArticleUrl(data.doi)
          SubmissionFormPage.fillInBioRxivArticleUrl(data.articleId)
          SubmissionFormPage.fillInDescription(data.description)
          SubmissionFormPage.clickSubmitResearch()

          // check for the submission form contains doi
          ManuscriptsPage.getOptionsElifeText('Evaluation').click()
          SubmissionFormPage.getArticleUrl().should('have.value', data.doi)
        })
      })
    })

    it('error message is available for incorrect doi link', () => {
      cy.task('restore', 'commons/elife_bootstrap')
      cy.task('seed', 'submission_complete') // task to restore the database as per the  dumps/submission_complete.sql
      // eslint-disable-next-line jest/valid-expect-in-promise
      // cy.task('seedForms')
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        // login as admin
        cy.login(name.role.admin, dashboard)

        // select Control on the Manuscripts page
        Menu.clickManuscripts()
        ManuscriptsPage.getOptionsElifeText('Evaluation').click()
        SubmissionFormPage.fillInArticleUrl(invalidDoiLnk)
        SubmissionFormPage.clickSubmitResearch()
        SubmissionFormPage.getValidationErrorMessage('DOI is invalid')
      })
    })
  })
})
