/* eslint-disable jest/expect-expect */
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { manuscripts } from '../../support/routes'
import { Menu } from '../../page-object/page-component/menu'

describe('Manuscripts page tests', () => {
  context('Elements visibility', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      ManuscriptsPage.getTableHeader().should('be.visible')
    })

    it('check Submit button is visible', () => {
      ManuscriptsPage.getSubmitButton().should('be.visible')
    })
    it('evaluation button is visible on unsubmited status article', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndVerifyLink()
      // fill the submit form and submit it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleld(data.articleId)
      })
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEvaluationButton().should('be.visible')
    })
  })

  context('unsubmitetd article tests', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      ManuscriptsPage.getTableHeader().should('be.visible')
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndVerifyLink()
      // fill the submit form and submit it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleld(data.articleId)
      })
      Menu.clickManuscriptsAndAssertPageLoad()
    })

    it('unsubmitted article is evaluated', () => {
      ManuscriptsPage.clickEvaluation()
      cy.url().should('contain', 'evaluation')

      SubmissionFormPage.getArticleUrl().should('have.value', '')
      SubmissionFormPage.getDescription().should('have.value', '')
      SubmissionFormPage.getEvaluationContent()
        .find('p')
        .should('have.value', '')
      SubmissionFormPage.getFormOptionValue(-1).should('have.value', '')
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleld(data.articleId)
        SubmissionFormPage.fillInArticleUrl(data.doi)
        SubmissionFormPage.fillInDescription(data.description)
        SubmissionFormPage.fillInEvaluationContent(data.evaluationContent)
        SubmissionFormPage.clickElementFromFormOptionList(4)
        SubmissionFormPage.selectDropdownOption(1)
        SubmissionFormPage.clickSubmitResearch()
        SubmissionFormPage.clickSubmitManuscriptAndWaitPageLoad()
      })
      ManuscriptsPage.getStatus(0).should('eq', 'evaluated')
    })

    it('sort article after Article id', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndVerifyLink()
      SubmissionFormPage.fillInArticleld('456')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndVerifyLink()
      SubmissionFormPage.fillInArticleld('abc')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndVerifyLink()
      SubmissionFormPage.fillInArticleld('def')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getArticleTitleByRow(0).should('contain', 'def')
      ManuscriptsPage.getArticleTitleByRow(1).should('contain', 'abc')
      ManuscriptsPage.getArticleTitleByRow(2).should('contain', '456')
      ManuscriptsPage.getArticleTitleByRow(3).should('contain', '123')
      ManuscriptsPage.clickTableHead(0)
      ManuscriptsPage.getArticleTitleByRow(0).should('contain', '123')
      ManuscriptsPage.getArticleTitleByRow(1).should('contain', '456')
      ManuscriptsPage.getArticleTitleByRow(2).should('contain', 'abc')
      ManuscriptsPage.getArticleTitleByRow(3).should('contain', 'def')
    })
  })

  context('Submitted and evaluated article tests', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)

        ManuscriptsPage.getTableHeader().should('be.visible')
        ManuscriptsPage.getEvaluationButton().should('not.exist')
        ManuscriptsPage.clickSubmit()

        NewSubmissionPage.clickSubmitUrlAndVerifyLink()

        // fill the submit form and submit it
        // eslint-disable-next-line jest/valid-expect-in-promise
        cy.fixture('submission_form_data').then(data => {
          SubmissionFormPage.fillInArticleld(data.articleId)
          SubmissionFormPage.fillInArticleUrl(data.doi)
          SubmissionFormPage.fillInDescription(data.description)
          SubmissionFormPage.fillInEvaluationContent(data.evaluationContent)
          SubmissionFormPage.clickElementFromFormOptionList(4)
          SubmissionFormPage.selectDropdownOption(1)
          SubmissionFormPage.fillInCreator(name.role.admin)
          // eslint-disable-next-line
          SubmissionFormPage.clickSubmitResearch()
          SubmissionFormPage.clickSubmitManuscriptAndWaitPageLoad()
        })
      })
    })
    it('after submitting an article, user is redirect to Manuscripts page', () => {
      // asserts on the manuscripts page
      ManuscriptsPage.getManuscriptsPageTitle().should('be.visible')
      ManuscriptsPage.getEvaluationButton().should('be.visible')
      ManuscriptsPage.getControlButton().should('not.exist')
      ManuscriptsPage.getOptionWithText('Publish').should('be.visible')
    })
    it('evaluate article and check status is changed', () => {
      ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
      ManuscriptsPage.clickEvaluation()

      SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()

      ManuscriptsPage.getStatus(0).should('eq', 'evaluated')
      ManuscriptsPage.getEvaluationButton().should('be.visible')
    })
    it('submission details should be visible', () => {
      ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
      ManuscriptsPage.clickEvaluation()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.getArticleld().should('have.value', data.articleId)
        SubmissionFormPage.getArticleUrl().should('have.value', data.doi)
        // eslint-disable-next-line
        SubmissionFormPage.getDescription().should(
          'have.value',
          data.description,
        )
        SubmissionFormPage.getEvaluationContent()
          .find('p')
          .should('contain', data.evaluationContent)
        // eslint-disable-next-line
        SubmissionFormPage.getFormOptionValue(-1).should(
          'contain',
          data.evaluationType,
        )
      })
    })
    it('evaluation changes should be visible', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        // eslint-disable-next-line jest/valid-expect-in-promise
        cy.fixture('role_names').then(name => {
          ManuscriptsPage.getAuthor(0).should('eq', name.role.admin)
          ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
        })
        ManuscriptsPage.clickEvaluation()
        SubmissionFormPage.fillInArticleld('123 - Evaluated')
        SubmissionFormPage.fillInArticleUrl('new url')
        SubmissionFormPage.fillInDescription('new description')
        SubmissionFormPage.fillInEvaluationContent('new content')
        SubmissionFormPage.clickElementFromFormOptionList(4)
        SubmissionFormPage.selectDropdownOption(-1)
        SubmissionFormPage.fillInCreator('creator')
        // eslint-disable-next-line
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
        ManuscriptsPage.clickEvaluation()
        // eslint-disable-next-line
        SubmissionFormPage.getArticleld().should(
          'not.have.value',
          data.articleId,
        )
        SubmissionFormPage.getArticleUrl().should('not.have.value', data.doi)
        // eslint-disable-next-line
        SubmissionFormPage.getDescription().should(
          'not.have.value',
          data.description,
        )
        SubmissionFormPage.getEvaluationContent()
          .find('p')
          .should('not.contain', data.evaluationContent)
        // eslint-disable-next-line
        SubmissionFormPage.getFormOptionValue(-1).should(
          'not.contain',
          data.evaluationType,
        )
      })
    })
    it('assert atricle id is the first table head and contains submitted atricle id title', () => {
      ManuscriptsPage.getTableHead(0).should('contain', 'Article Id')
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        ManuscriptsPage.getArticleTitleByRow(0).should(
          'contain',
          data.articleId,
        )
      })
    })
  })
})
