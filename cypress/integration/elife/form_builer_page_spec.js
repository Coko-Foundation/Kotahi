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

    it('check title and elements from form builder', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        FormsPage.getFormBuilderElementName(0).should(
          'contain',
          data.elife.articleId,
        )
        FormsPage.getFormBuilderElementName(1).should(
          'contain',
          data.elife.articleUrl,
        )
        FormsPage.getFormBuilderElementName(2).should(
          'contain',
          data.elife.description,
        )
        FormsPage.getFormBuilderElementName(3).should(
          'contain',
          data.elife.evaluationContent,
        )
        FormsPage.getFormBuilderElementName(4).should(
          'contain',
          data.elife.evaluationType,
        )
        FormsPage.getFormBuilderElementName(5).should(
          'contain',
          data.elife.creator,
        )
      })
    })

    // check the type of the field and if is required
    it('first element check to have options TextField and Required selected', () => {
      FormsPage.clickFormOption(0)
      FormsPage.getComponentType().should('contain', 'TextField')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(1)
      FormsPage.getComponentType().should('contain', 'TextField')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(2)
      FormsPage.getComponentType().should('contain', 'TextField')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(3)
      FormsPage.getComponentType().should('contain', 'AbstractEditor')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(4)
      FormsPage.getComponentType().should('contain', 'Select')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(5)
      FormsPage.getComponentType().should('contain', 'TextField')
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
      NewSubmissionPage.clickSubmitUrlAndVerifyLink()
    })

    // check if the form contain all the columns
    it('check if the form contain all the columns', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        SubmissionFormPage.getFormOptionList(0).should(
          'contain',
          data.elife.articleId,
        )
        SubmissionFormPage.getFormOptionList(1).should(
          'contain',
          data.elife.articleUrl,
        )
        SubmissionFormPage.getFormOptionList(2).should(
          'contain',
          data.elife.description,
        )
        SubmissionFormPage.getFormOptionList(3).should(
          'contain',
          data.elife.evaluationContent,
        )
        SubmissionFormPage.getFormOptionList(4).should(
          'contain',
          data.elife.evaluationType,
        )
        SubmissionFormPage.getFormOptionList(5).should(
          'contain',
          data.elife.creator,
        )
      })
    })

    // check if it is displayed the required message
    it('check required message', () => {
      SubmissionFormPage.clickSubmitResearch()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        SubmissionFormPage.getFormOptionList(0).should(
          'contain',
          data.elife.required,
        )
        SubmissionFormPage.getFormOptionList(1).should(
          'contain',
          data.elife.required,
        )
        SubmissionFormPage.getFormOptionList(2).should(
          'contain',
          data.elife.required,
        )
        SubmissionFormPage.getFormOptionList(3).should(
          'contain',
          data.elife.required,
        )
        SubmissionFormPage.getFormOptionList(4).should(
          'contain',
          data.elife.required,
        )
      })
    })

    // check if the options: Evaluation Summary, Peer Review and Author Response are available in Evaluation Type field
    it('check Evaluation Type filed options', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        SubmissionFormPage.clickElementFromFormOptionList(4)
        SubmissionFormPage.getDropdownOption(0).should(
          'contain',
          data.elife.evaluationTypes.evaluationSummary,
        )
        SubmissionFormPage.getDropdownOption(1).should(
          'contain',
          data.elife.evaluationTypes.peerReview,
        )
        SubmissionFormPage.getDropdownOption(2).should(
          'contain',
          data.elife.evaluationTypes.authorResponse,
        )
      })
    })
  })
})
