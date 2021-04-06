import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe('manuscripts page tests', () => {
  beforeEach(() => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
  })
  context('elements visibility', () => {
    it('submit button should be visible & dashboard page should not exist', () => {
      ManuscriptsPage.getSubmitButton().should('be.visible')
      Menu.getDashboardButton().should('not.exist')
    })

    it('evaluation button should be visible for unsubmitted articles', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitURL()
      // fill the submit form and submit it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleDescription(data.articleId)
      })
      Menu.clickManuscripts()
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
    })
    it('label & topics should be visible on manuscripts page', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitURL()
      // fill the submit form and submit it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.clickDropdown(-1)
        SubmissionFormPage.selectDropdownOption(1)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.clickTopicsCheckboxWithText('epidemiology')
        Menu.clickManuscripts()
        ManuscriptsPage.getArticleLabel()
          .should('be.visible')
          .and('contain', 'evaluated')
        ManuscriptsPage.getArticleTopic(0).should('contain', data.topic)
        ManuscriptsPage.getArticleTopic(1).should('contain', 'epidemiology')
      })
    })
  })
  context('unsubmitted article tests', () => {
    beforeEach(() => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitURL()
    })

    it('unsubmitted article is evaluated', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleDescription(data.title)
      })
      Menu.clickManuscripts()
      ManuscriptsPage.clickEvaluation()
      cy.url().should('contain', 'evaluation')
      SubmissionFormPage.getArticleUrl().should('have.value', '')
      // eslint-disable-next-line
      SubmissionFormPage.getOurTakeContent().should('have.value', '')
      SubmissionFormPage.getDropdown(0).should('have.value', '')
      SubmissionFormPage.getStudySettingContent().should('have.value', '')
      SubmissionFormPage.getMainFindingsContent().should('have.value', '')
      SubmissionFormPage.getStudyStrengthsContent().should('have.value', '')
      SubmissionFormPage.getLimitationsContent().should('have.value', '')
      SubmissionFormPage.getValueAddedContent().should('have.value', '')
      SubmissionFormPage.getDropdown(1).should('have.value', '')
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleUrl(data.doi)
        SubmissionFormPage.fillInArticleDescription(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickDropdown(0)
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInStudySetting(data.studySetting)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickDropdown(-1)
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.clickSubmitManuscript()
        ManuscriptsPage.getStatus(0).should('eq', 'evaluated')
        ManuscriptsPage.getArticleTopic(0)
          .should('be.visible')
          .should('contain', data.topic)
        ManuscriptsPage.getArticleLabel().should('contain', 'ready to evaluate')
      })
    })
  })
  context('submitted and evaluated article tests', () => {
    beforeEach(() => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitURL()
      // fill the submit form and submit it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleUrl(data.doi)
        SubmissionFormPage.fillInArticleDescription(data.title)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickDropdown(0)
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInStudySetting(data.studySetting)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickDropdown(-1)
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.clickSubmitManuscript()
      })
    })
    it('manuscripts page should contain the correct details after submission', () => {
      cy.url().should('contain', 'manuscripts')
      ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
      ManuscriptsPage.getManuscriptsPageTitle().should('be.visible')
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
      ManuscriptsPage.getControlButton().should('not.exist')
      ManuscriptsPage.getOptionWithText('View').should('be.visible')
      ManuscriptsPage.getOptionWithText('Delete').should('be.visible')
      ManuscriptsPage.getOptionWithText('Publish').should('be.visible')
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        ManuscriptsPage.getArticleTopic(0)
          .should('be.visible')
          .should('contain', data.topic)
      })
      ManuscriptsPage.getArticleLabel().should('contain', 'ready to evaluate')
    })
    it('evaluate article and check status is changed', () => {
      ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
      ManuscriptsPage.clickEvaluation(0)

      SubmissionFormPage.clickSubmitManuscript()

      ManuscriptsPage.getStatus(0).should('eq', 'evaluated')
    })
    it('evaluation changes should be visible', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
        ManuscriptsPage.clickEvaluation(0)
        SubmissionFormPage.fillInValueAdded('Evaluated')
        SubmissionFormPage.clickTopicsCheckboxWithText('vaccines')
        SubmissionFormPage.clickSubmitManuscript()
        ManuscriptsPage.clickEvaluation()
        // eslint-disable-next-line
        SubmissionFormPage.getValueAddedField().should(
          'not.have.text',
          data.valueAdded,
        )
        SubmissionFormPage.getValueAddedField().should('have.text', 'Evaluated')
      })
    })
  })
  context('filter by topics and sort by label', () => {
    beforeEach(() => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitURL()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('form_option').then(data => {
        SubmissionFormPage.clickElementFromFormOptionList(9)
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.ncrc.topicTypes.vaccines)
        Menu.clickManuscripts()
        ManuscriptsPage.clickSubmit()
        NewSubmissionPage.clickSubmitURL()
        SubmissionFormPage.clickElementFromFormOptionList(9)
        SubmissionFormPage.selectDropdownOption(1)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.ncrc.topicTypes.ecologyAndSpillover)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.ncrc.topicTypes.diagnostics)
        Menu.clickManuscripts()
        ManuscriptsPage.clickSubmit()
        NewSubmissionPage.clickSubmitURL()
        SubmissionFormPage.clickElementFromFormOptionList(9)
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.ncrc.topicTypes.modeling)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.ncrc.topicTypes.diagnostics)
        Menu.clickManuscripts()
      })
    })
    it('filter article after topic and url contain that topic', () => {
      ManuscriptsPage.clickArticleTopic(-1)
      ManuscriptsPage.getTableRows().should('eq', 1)
      cy.url().should('contain', 'vaccines')
      ManuscriptsPage.getArticleTopic(0).should('contain', 'vaccines')
      Menu.clickManuscripts()
      ManuscriptsPage.clickArticleTopic(1)
      ManuscriptsPage.getTableRows().should('eq', 2)
      cy.url().should('contain', 'diagnostics')
      ManuscriptsPage.getArticleTopic(0).should('contain', 'modeling')
      ManuscriptsPage.getArticleTopic(1).should('contain', 'diagnostics')
      ManuscriptsPage.getArticleTopic(2).should('contain', 'ecology and spillover')
      ManuscriptsPage.getArticleTopic(3).should('contain', 'diagnostics')
      Menu.clickManuscripts()
      ManuscriptsPage.clickArticleTopic(0)
      ManuscriptsPage.getTableRows().should('eq', 1)
      cy.url().should('contain', 'modeling')
      ManuscriptsPage.getArticleTopic(0).should('contain', 'modeling')
      ManuscriptsPage.getArticleTopic(1).should('contain', 'diagnostics')
    })
    it('sort article by label', () => {
      ManuscriptsPage.getLabelRow(1).should('contain', 'evaluated')
      ManuscriptsPage.getLabelRow(2).should('contain', 'ready to evaluat')
      ManuscriptsPage.clickTableHead(5)
      ManuscriptsPage.getLabelRow(0).should('contain', 'evaluated')
      ManuscriptsPage.getLabelRow(1).should('contain', 'ready to evaluat')
      ManuscriptsPage.getLabelRow(2).should('contain', 'ready to evaluat')
    })
  })
})
