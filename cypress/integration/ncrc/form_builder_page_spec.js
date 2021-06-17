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
      cy.task('restore', 'initial_state_ncrc')
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
        FormsPage.getFormTitleTab(0).should('contain', data.ncrc.title)

        const dataArray = [
          data.ncrc.articleUrl,
          data.ncrc.description,
          data.ncrc.ourTake,
          data.ncrc.studyDesign,
          data.ncrc.mainFindings,
          data.ncrc.studyStrengths,
          data.ncrc.limitations,
          data.ncrc.valueAdded,
          data.ncrc.labels,
          data.ncrc.topics,
          data.ncrc.abstract,
          data.ncrc.firstAuthor,
          data.ncrc.datePublished,
          data.ncrc.studyPopulation,
          data.ncrc.keywords,
          data.ncrc.journal,
          data.ncrc.editFinished,
          data.ncrc.reviewer,
          data.ncrc.editDate,
          data.ncrc.finalTakeWordcount,
          data.ncrc.compendiumFeature,
          data.ncrc.reviewCreator,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 22; i++) {
          FormsPage.getFormBuilderElementName(i).should('contain', dataArray[i])
        }
      })
    })

    it('check form field type & assert field is mandatory', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        FormsPage.clickFormOptionWithText(data.ncrc.articleUrl)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.description)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.ourTake)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.studyDesign)
        FormsPage.getComponentType().should('contain', 'Select')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.mainFindings)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.studyStrengths)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.limitations)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.valueAdded)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.labels)
        FormsPage.getComponentType().should('contain', 'Select')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.topics)
        FormsPage.getComponentType().should('contain', 'CheckboxGroup')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.abstract)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.firstAuthor)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.datePublished)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.studyPopulation)
        FormsPage.getComponentType().should('contain', 'AbstractEditor')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.keywords)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.journal)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.editFinished)
        FormsPage.getComponentType().should('contain', 'Select')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.reviewer)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.editDate)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.finalTakeWordcount)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.compendiumFeature)
        FormsPage.getComponentType().should('contain', 'Select')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.reviewCreator)
        FormsPage.getComponentType().should('contain', 'TextField')
        FormsPage.getFieldValidate().should('contain', 'Required')
      })
    })
  })
  context('check submission form corresponds to form builder', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initial_state_ncrc')
      cy.task('seedForms')
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
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
          data.ncrc.mainFindings,
          data.ncrc.studyStrengths,
          data.ncrc.limitations,
          data.ncrc.valueAdded,
          data.ncrc.labels,
          data.ncrc.topics,
          data.ncrc.abstract,
          data.ncrc.firstAuthor,
          data.ncrc.datePublished,
          data.ncrc.studyPopulation,
          data.ncrc.keywords,
          data.ncrc.journal,
          data.ncrc.editFinished,
          data.ncrc.reviewer,
          data.ncrc.editDate,
          data.ncrc.finalTakeWordcount,
          data.ncrc.compendiumFeature,
          data.ncrc.reviewCreator,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 22; i++) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            dataArray[i],
          )
        }
      })
    })

    it('check required message is displayed for all required fields', () => {
      SubmissionFormPage.clickSubmitResearch()

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 10; i++) {
        SubmissionFormPage.getFormOptionList(i).should('contain', 'Required')
      }

      SubmissionFormPage.getFormOptionList(10).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(11).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(12).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(13).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(14).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(15).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(16).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(17).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(18).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(19).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(20).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(21).should('contain', 'Required')
    })

    it('message for DOI invalid should not exist ', () => {
      SubmissionFormPage.fillInArticleUrl('google.com')
      SubmissionFormPage.fillInArticleDescription('2')
      SubmissionFormPage.getValidationErrorMessage('DOI is invalid').should(
        'not.exist',
      )
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

    it('check edit finished dropdown options', () => {
      SubmissionFormPage.clickElementFromFormOptionList(16)
      SubmissionFormPage.getDropdownOption(0).should('contain', 'True')
      SubmissionFormPage.getDropdownOption(1).should('contain', 'False')
    })

    it('check compendium feature dropdown options', () => {
      SubmissionFormPage.clickElementFromFormOptionList(20)
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        SubmissionFormPage.getDropdownOption(0).should(
          'contain',
          data.ncrc.compendiumFeatureTypes.no,
        )
        SubmissionFormPage.getDropdownOption(1).should(
          'contain',
          data.ncrc.compendiumFeatureTypes.mediumLow,
        )
        SubmissionFormPage.getDropdownOption(2).should(
          'contain',
          data.ncrc.compendiumFeatureTypes.high,
        )
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

        SubmissionFormPage.clickElementFromFormOptionList(8)

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
