/* eslint-disable jest/expect-expect */
import { formBuilder, dashboard } from '../../support/routes'
import { FormsPage } from '../../page-object/forms-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('form builder tests', () => {
  context('check form builder elements visibility', () => {
    beforeEach(() => {
      // task to restore the database as per the dumps/initial_state_other.sql
      cy.task('restore', 'initial_state_other')
      cy.task('seedForms')
      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, formBuilder)
      })
      FormsPage.verifyPageLoaded()
    })

    it('check form entries are correct', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        FormsPage.getFormTitleTab(0).should('contain', data.formTitle)

        const dataArray = [
          data.colab.title,
          data.colab.doi,
          data.common.abstract,
          data.common.firstAuthor,
          data.common.datePublished,
          data.colab.link,
          data.common.topics,
          data.common.ourTake,
          data.colab.mainFindings,
          data.common.studyStrengths,
          data.common.limitations,
          data.common.keywords,
          data.common.journal,
          data.common.editDate,
          data.common.labels,
          data.common.reviewCreator,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 16; i++) {
          FormsPage.getFormBuilderElementName(i).should('contain', dataArray[i])
        }
      })
    })

    it('check form field type & assert field is mandatory', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        FormsPage.clickFormOptionWithText(data.colab.title)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.colab.doi)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.abstract)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.firstAuthor)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.datePublished)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.colab.link)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.topics)
        FormsPage.getComponentType().should('contain', 'CheckboxGroup')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.ourTake)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.colab.mainFindings)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.studyStrengths)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.limitations)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.keywords)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.journal)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.editDate)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.labels)
        FormsPage.getComponentType().should('contain', 'Select')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.reviewCreator)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
      })
    })
  })
  context('check submission form corresponds to form builder', () => {
    beforeEach(() => {
      // task to restore the database as per the dumps/initial_state_other.sql
      cy.task('restore', 'initial_state_other')
      cy.task('seedForms')
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)
      })
      cy.awaitDisappearSpinner()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    })

    it('check submission form contains the same fields', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const dataArray = [
          data.colab.title,
          data.colab.doi,
          data.common.abstract,
          data.common.firstAuthor,
          data.common.datePublished,
          data.colab.link,
          data.common.topics,
          data.common.ourTake,
          data.colab.mainFindings,
          data.common.studyStrengths,
          data.common.limitations,
          data.common.keywords,
          data.common.journal,
          data.common.editDate,
          data.common.labels,
          data.common.reviewCreator,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 16; i++) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            dataArray[i],
          )
        }
      })
    })

    it('check required message is displayed for all required fields', () => {
      SubmissionFormPage.clickSubmitResearch()

      SubmissionFormPage.getFormOptionList(0).its('val').should('not.be', '')
      SubmissionFormPage.getFormOptionList(1).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(2).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(3).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(4).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(5).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(6).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(7).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(8).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(9).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(10).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(11).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(12).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(13).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(14).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(15).should('contain', 'Required')
    })

    it('message for DOI invalid should not exist ', () => {
      SubmissionFormPage.fillInDoi('google.com')
      SubmissionFormPage.getWaxInputBox(0).fillInput('test')
      SubmissionFormPage.getValidationErrorMessage('DOI is invalid').should(
        'not.exist',
      )
    })

    it('check label dropdown options', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const dataArray = [
          data.common.labelTypes.readyToEvaluate,
          data.common.labelTypes.evaluated,
          data.common.labelTypes.readyToPublish,
        ]

        SubmissionFormPage.clickLabelsDropdown()

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 3; i++) {
          SubmissionFormPage.getDropdownOption(i).should(
            'contain',
            dataArray[i],
          )
        }
      })
    })

    it('check topic checkbox options', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const valueArray = [
          data.common.topicTypes.ecologyAndSpillover,
          data.common.topicTypes.vaccines,
          data.common.topicTypes.interventions,
          data.common.topicTypes.epidemiology,
          data.common.topicTypes.diagnostics,
          data.common.topicTypes.modeling,
          data.common.topicTypes.clinicalPresentation,
          data.common.topicTypes.prognosticRiskFactors,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 8; i++) {
          SubmissionFormPage.getTopicsCheckboxWithText(`"${valueArray[i]}"`)
            .scrollIntoView()
            .should('be.visible')
        }
      })
    })
  })
})
