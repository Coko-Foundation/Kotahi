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
      const restoreUrl = Cypress.config('restoreUrl')
      cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)

      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      ManuscriptsPage.getTableHead().should('be.visible')
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoadElife()
    })

    it('check if the form contain all the fields', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const formElements = [
          data.preprint1.articleId,
          data.preprint1.articleDoi,
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

        for (let i = 0; i < formElements.length; i += 1) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            formElements[i],
          )
        }
      })
    })

    // check if it is displayed the required message
    it('check required message', () => {
      SubmissionFormPage.clickElifeSubmitResearch()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 4; i++) {
          SubmissionFormPage.getFormOptionList(i)
            .get('[class*="MessageWrapper"]')
            .should('contain', data.required)
        }
      })
    })
  })

  context('DOI validations', () => {
    it('check doi link is available in submission form', () => {
      const restoreUrl = Cypress.config('restoreUrl')
      const seedUrl = Cypress.config('seedUrl')

      cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)
      cy.request('POST', `${seedUrl}/submission_complete`)

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
          SubmissionFormPage.fillInDoi(data.doi)
          SubmissionFormPage.fillInPreprintUri(data.articleId)
          SubmissionFormPage.fillInTitle(data.description)
          SubmissionFormPage.clickElifeSubmitResearch()

          // check for the submission form contains doi
          ManuscriptsPage.getOptionsElifeText('Evaluation').click()
          SubmissionFormPage.getDoi().should(
            'have.value',
            data.doi.split('https://doi.org/')[1],
          )
        })
      })
    })

    it('error message is available for incorrect doi link', () => {
      const restoreUrl = Cypress.config('restoreUrl')
      const seedUrl = Cypress.config('seedUrl')

      cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)
      cy.request('POST', `${seedUrl}/submission_complete`)

      // eslint-disable-next-line jest/valid-expect-in-promise
      // cy.task('seedForms')
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        // login as admin
        cy.login(name.role.admin, dashboard)

        // select Control on the Manuscripts page
        Menu.clickManuscripts()
        ManuscriptsPage.getOptionsElifeText('Evaluation').click()
        SubmissionFormPage.fillInDoi(invalidDoiLnk)
        SubmissionFormPage.clickElifeSubmitResearch()
        SubmissionFormPage.getValidationErrorMessage('DOI is invalid')
      })
    })
  })
})
