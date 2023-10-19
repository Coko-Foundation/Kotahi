/* eslint-disable jest/expect-expect,no-plusplus,jest/valid-expect-in-promise */
import { formBuilder, manuscripts } from '../../support/routes'
import { FormsPage } from '../../page-object/forms-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'

describe.skip('form builder tests', () => {
  context('check form builder elements visibility', () => {
    beforeEach(() => {
      // task to restore the database as per the dumps/initial_state_other.sql
      cy.task('restore', 'initial_state_other')
      cy.task('seedForms')
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, formBuilder)
      })
      FormsPage.verifyPageLoaded()
    })

    it('check form entries are correct', () => {
      cy.fixture('form_option').then(data => {
        FormsPage.getFormTitleTab(0).should('contain', data.ncrc.title)

        const dataArray = [
          data.ncrc.articleUrl,
          data.ncrc.description,
          data.common.ourTake,
          data.ncrc.studyDesign,
          data.ncrc.mainFindings,
          data.common.studyStrengths,
          data.common.limitations,
          data.ncrc.valueAdded,
          data.common.labels,
          data.ncrc.subTopics,
          data.common.topics,
          data.common.abstract,
          data.common.firstAuthor,
          data.common.datePublished,
          data.ncrc.studyPopulation,
          data.common.journal,
          data.ncrc.reviewer,
          data.common.editDate,
          data.ncrc.compendiumFeature,
          data.common.reviewCreator,
        ]

        for (let i = 0; i < 20; i++) {
          FormsPage.getFormBuilderElementName(i).should('contain', dataArray[i])
        }
      })
    })

    it('check form field type & assert field is mandatory', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        FormsPage.clickFormOptionWithText(data.ncrc.articleUrl)
        FormsPage.getComponentType().should('contain', 'Text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.description)
        FormsPage.getComponentType().should('contain', 'Text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.ourTake)
        FormsPage.getComponentType().should('contain', 'Rich text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.studyDesign)
        FormsPage.getComponentType().should('contain', 'Select')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.mainFindings)
        FormsPage.getComponentType().should('contain', 'Rich text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.studyStrengths)
        FormsPage.getComponentType().should('contain', 'Rich text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.limitations)
        FormsPage.getComponentType().should('contain', 'Rich text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.valueAdded)
        FormsPage.getComponentType().should('contain', 'Rich text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.labels)
        FormsPage.getComponentType().should('contain', 'Select')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.subTopics)
        FormsPage.getComponentType().should('contain', 'Checkboxes')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOption(10)
        FormsPage.getComponentType().should('contain', 'Checkboxes')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.abstract)
        FormsPage.getComponentType().should('contain', 'Rich text')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.firstAuthor)
        FormsPage.getComponentType().should('contain', 'Text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.datePublished)
        FormsPage.getComponentType().should('contain', 'Text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.studyPopulation)
        FormsPage.getComponentType().should('contain', 'Rich text')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.journal)
        FormsPage.getComponentType().should('contain', 'Text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.reviewer)
        FormsPage.getComponentType().should('contain', 'Text')
        FormsPage.getFieldValidate().should('contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.editDate)
        FormsPage.getComponentType().should('contain', 'Text')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.ncrc.compendiumFeature)
        FormsPage.getComponentType().should('contain', 'Select')
        FormsPage.getFieldValidate().should('not.contain', 'Required')
        FormsPage.clickFormOptionWithText(data.common.reviewCreator)
        FormsPage.getComponentType().should('contain', 'Text')
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
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHeader().should('be.visible')
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    })

    it('check submission form contains the same fields', () => {
      cy.fixture('form_option').then(data => {
        const dataArray = [
          data.ncrc.articleUrl,
          data.ncrc.description,
          data.common.ourTake,
          data.ncrc.studyDesign,
          data.ncrc.mainFindings,
          data.common.studyStrengths,
          data.common.limitations,
          data.ncrc.valueAdded,
          data.common.labels,
          data.ncrc.subTopics,
          data.common.topics,
          data.common.abstract,
          data.common.firstAuthor,
          data.common.datePublished,
          data.ncrc.studyPopulation,
          data.common.journal,
          data.ncrc.reviewer,
          data.common.editDate,
          data.ncrc.compendiumFeature,
          data.common.reviewCreator,
        ]

        for (let i = 0; i < 20; i++) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            dataArray[i],
          )
        }
      })
    })

    it('check required message is displayed for all required fields', () => {
      SubmissionFormPage.clickSubmitResearch()

      for (let i = 0; i < 9; i++) {
        SubmissionFormPage.getFormOptionList(i).should('contain', 'Required')
      }

      SubmissionFormPage.getFormOptionList(9).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(10).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(11).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(12).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(13).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(14).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(15).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(16).should('contain', 'Required')
      SubmissionFormPage.getFormOptionList(17).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(18).should('not.contain', 'Required')
      SubmissionFormPage.getFormOptionList(19).should('contain', 'Required')
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
          data.ncrc.studyDesignTypes.crossSectional,
          data.ncrc.studyDesignTypes.prospectiveCohort,
          data.ncrc.studyDesignTypes.retrospectiveCohort,
          data.ncrc.studyDesignTypes.ecological,
          data.ncrc.studyDesignTypes.randomizedControlTrial,
          data.ncrc.studyDesignTypes.modelingSimulation,
          data.ncrc.studyDesignTypes.other,
          data.ncrc.studyDesignTypes.nonRandomizedTrial,
          data.ncrc.studyDesignTypes.caseControl,
        ]

        SubmissionFormPage.clickElementFromFormOptionList(3)

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 8; i++) {
          SubmissionFormPage.getDropdownOption(i).should(
            'contain',
            dataArray[i],
          )
        }
      })
    })

    it('check subtopic checkboxes options', () => {
      cy.fixture('form_option').then(data => {
        const subTopics = [
          data.ncrc.subTopicTypes.epidemiologyPopulationsMostVulnerable,
          data.ncrc.subTopicTypes
            .epidemiologyIncubationPeriodSignsAndSymptomsAndViralShedding,
          data.ncrc.subTopicTypes
            .epidemiologyPopulationBasedPrevalenceAndBurdenOfDisease,
          data.ncrc.subTopicTypes.epidemiologyTransmission,
          data.ncrc.subTopicTypes.epidemiologyRiskForInfection,
          data.ncrc.subTopicTypes
            .epidemiologyVirusMutationsTrackingSpreadAndEvolutionInPeople,
          data.ncrc.subTopicTypes
            .ecologySpilloverEvolutionaryOriginAndZoonoticSpilloverOfSarsCov2,
          data.ncrc.subTopicTypes
            .ecologySpilloverSarsCov2InfectionInDomesticAnimals,
          data.ncrc.subTopicTypes
            .nonPharmaceuticalInterventionsTestingAndContactTracing,
          data.ncrc.subTopicTypes.nonPharmaceuticalInterventionsMasks,
          data.ncrc.subTopicTypes
            .nonPharmaceuticalInterventionsSchoolAndBusinessClosures,
          data.ncrc.subTopicTypes
            .nonPharmaceuticalInterventionsSymptomScreening,
          data.ncrc.subTopicTypes.vaccinesTrialResults,
          data.ncrc.subTopicTypes.vaccinesOtherVaccineAndVirologyRelatedTopics,
          data.ncrc.subTopicTypes.vaccinesTrialProtocol,
          data.ncrc.subTopicTypes
            .clinicalPresentationPrognosticRiskFactorsAceInhibitors,
          data.ncrc.subTopicTypes
            .clinicalPresentationPrognosticRiskFactorsCoagulopathy,
          data.ncrc.subTopicTypes
            .clinicalPresentationPrognosticRiskFactorsNonRespiratoryPresentation,
          data.ncrc.subTopicTypes
            .clinicalPresentationPrognosticRiskFactorsLongTermSequelae,
          data.ncrc.subTopicTypes
            .clinicalPresentationPrognosticRiskFactorsImmuneResponse,
          data.ncrc.subTopicTypes
            .clinicalPresentationPrognosticRiskFactorsPediatrics,
          data.ncrc.subTopicTypes
            .clinicalPresentationPrognosticRiskFactorsPregnancy,
          data.ncrc.subTopicTypes
            .clinicalPresentationPrognosticRiskFactorsPrognosticTools,
          data.ncrc.subTopicTypes
            .modelingCovid19MortalityMorbidityAndDemandForHealthcareServices,
          data.ncrc.subTopicTypes
            .modelingImpactOnHealthcareServicesForNonRespiratoryDiseases,
          data.ncrc.subTopicTypes.modelingMasks,
          data.ncrc.subTopicTypes.modelingSchoolAndBusinessClosures,
          data.ncrc.subTopicTypes
            .modelingStayAtHomeOrdersAndMobilityRestrictions,
          data.ncrc.subTopicTypes.modelingTestingAndContactTracing,
          data.ncrc.subTopicTypes.modelingTransmissionDynamics,
          data.ncrc.subTopicTypes.modelingSymptomScreening,
          data.ncrc.subTopicTypes.modelingVaccines,
          data.ncrc.subTopicTypes
            .nonPharmaceuticalInterventionsStayAtHomeOrdersAndMobilityRestrictions,
        ]

        for (let i = 0; i < subTopics.length; i++) {
          SubmissionFormPage.getSubTopicsCheckboxContainingText(subTopics[i])
        }
      })
    })

    it('check compendium feature dropdown options', () => {
      SubmissionFormPage.clickElementFromFormOptionList(18)
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        SubmissionFormPage.getDropdownOption(0).should(
          'contain',
          data.ncrc.compendiumFeatureTypes.mediumLow,
        )
        SubmissionFormPage.getDropdownOption(1).should(
          'contain',
          data.ncrc.compendiumFeatureTypes.high,
        )
      })
    })

    it('check label dropdown options', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        const dataArray = [
          data.common.labelTypes.readyToEvaluate,
          data.common.labelTypes.evaluated,
          data.common.labelTypes.readyToPublish,
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
          data.ncrc.topicTypes.nonPharmaceuticalInterventions,
          data.ncrc.topicTypes.epidemiology,
          data.ncrc.topicTypes.diagnostics,
          data.ncrc.topicTypes.modeling,
          data.ncrc.topicTypes.clinicalPresentation,
          data.ncrc.topicTypes.pharmaceuticalInterventions,
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
