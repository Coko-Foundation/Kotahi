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
          data.elife.description,
          data.elife.evaluationContent,
          data.elife.evaluationType,
          data.elife.creator,
        ]
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 6; i++) {
          FormsPage.getFormBuilderElementName(i).should(
            'contain',
            formElements[i]
          )
        }
      })
    })

    // check the type of the field and if is required
    it('check form fields type and if are required', () => {
      const requiredField = 'Required';
      const typeField = [
        'TextField',
        'TextField',
        'TextField',
        'AbstractEditor',
        'Select',
        'TextField',
      ]
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 6; i++) {
        FormsPage.clickFormOption(i)
        FormsPage.getComponentType().should('contain', typeField[i])
      };
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < 5; j++) {
        FormsPage.clickFormOption(j)
        FormsPage.getFieldValidate().should('contain', requiredField)
      }
      FormsPage.clickFormOption(5)
      FormsPage.getFieldValidate().should('not.contain', 'Required')
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
          data.elife.description,
          data.elife.evaluationContent,
          data.elife.evaluationType,
          data.elife.creator,
        ]
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 6; i++) {
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
        for (let i = 0; i < 5; i++) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            data.elife.required,
          )
        }
      })
    })

    // check if the options: Evaluation Summary, Peer Review and Author Response are available in Evaluation Type field
    it('check Evaluation Type filed options', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        SubmissionFormPage.clickElementFromFormOptionList(4)
        const dropDownOption = [
          data.elife.evaluationTypes.evaluationSummary,
          data.elife.evaluationTypes.peerReview,
          data.elife.evaluationTypes.authorResponse,
        ]
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 3; i++) {
          SubmissionFormPage.getDropdownOption(i).should(
            'contain',
            dropDownOption[i])
        }
      })
    })
  })
})