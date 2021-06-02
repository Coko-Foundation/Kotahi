/* eslint-disable jest/expect-expect */
import { FormsPage } from '../../page-object/forms-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { formBuilder, manuscripts } from '../../support/routes'

describe('Form builder page tests', () => {
  // check the title and the elements in Form Builder
  context('check Form builder elements visibility', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')
      cy.task('seedForms')
      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, formBuilder)
      })
      FormsPage.verifyPageLoaded()
    })

    it('check elements from form builder', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const formElements = [
          data.elife.articleId,
          data.elife.articleUrl,
          data.elife.bioRxivArticleUrl,
          data.elife.description,
          data.elife.review1,
          data.elife.review1Creator,
          data.elife.review1Date,
          data.elife.review2,
          data.elife.review2Creator,
          data.elife.review2Date,
          data.elife.review3,
          data.elife.review3Creator,
          data.elife.review3Date,
          data.elife.summary,
          data.elife.summaryCreator,
          data.elife.summaryDate,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 16; i++) {
          FormsPage.getFormBuilderElementName(i).should(
            'contain',
            formElements[i],
          )
        }
      })
    })

    // check the type of the field and if is required
    it('check form fields type and if are required', () => {
      const requiredField = 'Required'

      const typeField = [
        'TextField',
        'TextField',
        'TextField',
        'TextField',
        'AbstractEditor',
        'TextField',
        'TextField',
        'AbstractEditor',
        'TextField',
        'TextField',
        'AbstractEditor',
        'TextField',
        'TextField',
        'AbstractEditor',
        'TextField',
        'TextField',
      ]

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 16; i++) {
        FormsPage.clickFormOption(i)
        FormsPage.getComponentType().should('contain', typeField[i])
      }

      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < 4; j++) {
        FormsPage.clickFormOption(j)
        FormsPage.getFieldValidate().should('contain', requiredField)
      }

      // eslint-disable-next-line no-plusplus
      for (let k = 5; k < 16; k++) {
        FormsPage.clickFormOption(k)
        FormsPage.getFieldValidate().should('not.contain', requiredField)
      }
    })
    it('check DOI validation has default selected Yes and select No', () => {
      FormsPage.clickFormOption(1)
      FormsPage.getDoiValidation(0).should('have.prop', 'checked')
      FormsPage.clickOptionsDoiVaildation(1)
      FormsPage.getDoiValidation(1).should('have.prop', 'checked')
    })
  })

  context('check the Submission form based on form builder', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')
      cy.task('seedForms')
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      ManuscriptsPage.getTableHeader().should('be.visible')
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    })

    // check if the form contain all the columns
    it('check if the form contain all the columns', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const formElements = [
          data.elife.articleId,
          data.elife.articleUrl,
          data.elife.bioRxivArticleUrl,
          data.elife.description,
          data.elife.review1,
          data.elife.review1Creator,
          data.elife.review1Date,
          data.elife.review2,
          data.elife.review2Creator,
          data.elife.review2Date,
          data.elife.review3,
          data.elife.review3Creator,
          data.elife.review3Date,
          data.elife.summary,
          data.elife.summaryCreator,
          data.elife.summaryDate,
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
            data.elife.required,
          )
        }
      })
    })
  })
})
