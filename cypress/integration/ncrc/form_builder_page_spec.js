/* eslint-disable jest/expect-expect */
import { formBuilder, manuscripts } from '../../support/routes'
import { FormsPage } from '../../page-object/forms-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'

describe('form builder tests', () => {
  context('check form builder elements visibility', () => {
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
    it('check form entries are correct', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        FormsPage.getFormTitleTab(0).should('contain', data.ncrc.title)

        const dataArray = [
          data.ncrc.articleUrl,
          data.ncrc.description,
          data.ncrc.ourTake,
          data.ncrc.studyDesign,
          data.ncrc.studyPopulation,
          data.ncrc.mainFindings,
          data.ncrc.studyStrengths,
          data.ncrc.limitations,
          data.ncrc.valueAdded,
          data.ncrc.labels,
          data.ncrc.topics,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 11; i++) {
          FormsPage.getFormBuilderElementName(i).should('contain', dataArray[i])
        }
      })
    })
    it('check form field type & assert field is mandatory', () => {
      FormsPage.clickFormOption(0)
      FormsPage.getComponentType().should('contain', 'TextField')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(1)
      FormsPage.getComponentType().should('contain', 'TextField')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(2)
      FormsPage.getComponentType().should('contain', 'AbstractEditor')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(3)
      FormsPage.getComponentType().should('contain', 'Select')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(4)
      FormsPage.getComponentType().should('contain', 'AbstractEditor')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(5)
      FormsPage.getComponentType().should('contain', 'AbstractEditor')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(6)
      FormsPage.getComponentType().should('contain', 'AbstractEditor')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(7)
      FormsPage.getComponentType().should('contain', 'AbstractEditor')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(8)
      FormsPage.getComponentType().should('contain', 'AbstractEditor')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(9)
      FormsPage.getComponentType().should('contain', 'Select')
      FormsPage.getFieldValidate().should('contain', 'Required')
      FormsPage.clickFormOption(10)
      FormsPage.getComponentType().should('contain', 'CheckboxGroup')
      FormsPage.getFieldValidate().should('contain', 'Required')
    })
    it('check DOI validation has default selected Yes and select No', () => {
      FormsPage.clickFormOption(0)
      FormsPage.getDoiValidation(0).should('have.prop', 'checked')
      FormsPage.clickOptionsDoiVaildation(1)
      FormsPage.getDoiValidation(1).should('have.prop', 'checked')
    })
  })
  context('check submission form corresponds to form builder', () => {
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

    it('check submission form contains the same fields', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const dataArray = [
          data.ncrc.articleUrl,
          data.ncrc.description,
          data.ncrc.ourTake,
          data.ncrc.studyDesign,
          data.ncrc.studyPopulation,
          data.ncrc.mainFindings,
          data.ncrc.studyStrengths,
          data.ncrc.limitations,
          data.ncrc.valueAdded,
          data.ncrc.labels,
          data.ncrc.topics,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 11; i++) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            dataArray[i],
          )
        }
      })
    })

    it('check required message is displayed for all fields', () => {
      SubmissionFormPage.clickSubmitManuscript()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 11; i++) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            data.elife.required,
          )
        }
      })
    })

    it('check study design dropdown options', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const dataArray = [
          data.ncrc.studyDesignTypes.caseSeries,
          data.ncrc.studyDesignTypes.caseControl,
          data.ncrc.studyDesignTypes.crossSectional,
          data.ncrc.studyDesignTypes.prospectiveCohort,
          data.ncrc.studyDesignTypes.retrospectiveCohort,
          data.ncrc.studyDesignTypes.ecological,
          data.ncrc.studyDesignTypes.ranomizedControlTrial,
          data.ncrc.studyDesignTypes.nonRandomizedTrial,
          data.ncrc.studyDesignTypes.modelingSimulation,
          data.ncrc.studyDesignTypes.other,
        ]

        SubmissionFormPage.clickElementFromFormOptionList(3)

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 10; i++) {
          SubmissionFormPage.getDropdownOption(i).should(
            'contain',
            dataArray[i],
          )
        }
      })
    })
    it('check label dropdown options', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const dataArray = [
          data.ncrc.labelTypes.readyToEvaluate,
          data.ncrc.labelTypes.evaluated,
          data.ncrc.labelTypes.readyToPublish,
        ]

        SubmissionFormPage.clickElementFromFormOptionList(9)

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
          data.ncrc.topicTypes.ecologyAndSpillover,
          data.ncrc.topicTypes.vaccines,
          data.ncrc.topicTypes.interventions,
          data.ncrc.topicTypes.epidemiology,
          data.ncrc.topicTypes.diagnostics,
          data.ncrc.topicTypes.modeling,
          data.ncrc.topicTypes.clinicalPresentation,
          data.ncrc.topicTypes.prognosticRiskFactors,
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
