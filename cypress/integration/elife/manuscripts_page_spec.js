/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable prettier/prettier */
/* eslint-disable jest/expect-expect */
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import {
  evaluationResultUrl,
  evaluationSummaryUrl,
  manuscripts,
} from '../../support/routes'
import { Menu } from '../../page-object/page-component/menu'
import { ResultAndSummaryPage } from '../../page-object/page-component/result_and_summary-page'

describe('Manuscripts page tests', () => {
  context('Elements visibility', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')
      cy.task('seedForms')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHeader().should('be.visible')
    })

    it('check Submit and Video Chat buttons are visible', () => {
      ManuscriptsPage.getSubmitButton().should('be.visible')
      ManuscriptsPage.getLiveChatButton().should('be.visible')
    })
    // eslint-disable-next-line jest/no-focused-tests
    it('evaluation button is visible and publish button is not visible on unsubmited status article', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleld(data.articleId)
      })
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
      ManuscriptsPage.getOptionWithText('Publish').should('not.exist')
    })
  })

  context('unsubmitetd article tests', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')
      cy.task('seedForms')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHeader().should('be.visible')
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
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
      SubmissionFormPage.getReview1().find('p').should('contain', '')
      SubmissionFormPage.getReview1Creator().should('have.value', '')
      SubmissionFormPage.getReview1Date().should('have.value', '')
      SubmissionFormPage.getReview2().find('p').should('contain', '')
      SubmissionFormPage.getReview2Creator().should('have.value', '')
      SubmissionFormPage.getReview2Date().should('have.value', '')
      SubmissionFormPage.getReview3().find('p').should('contain', '')
      SubmissionFormPage.getReview3Creator().should('have.value', '')
      SubmissionFormPage.getReview3Date().should('have.value', '')
      SubmissionFormPage.getSummary().find('p').should('contain', '')
      SubmissionFormPage.getSummaryCreator().should('have.value', '')
      SubmissionFormPage.getSummaryDate().should('have.value', '')

      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleld(data.articleId)
        SubmissionFormPage.fillInArticleUrl(data.doi)
        SubmissionFormPage.fillInBioRxivArticleUrl(data.articleId)
        SubmissionFormPage.fillInDescription(data.description)
        SubmissionFormPage.fillInReview1(data.review1)
        SubmissionFormPage.fillInReview1Creator(data.creator)
        SubmissionFormPage.fillInReview1Date(data.review1Date)
        SubmissionFormPage.fillInReview2(data.review2)
        SubmissionFormPage.fillInReview2Creator(data.creator)
        SubmissionFormPage.fillInReview2Date(data.review2Date)
        SubmissionFormPage.fillInReview3(data.review3)
        SubmissionFormPage.fillInReview3Creator(data.creator)
        SubmissionFormPage.fillInReview3Date(data.review3Date)
        SubmissionFormPage.fillInSummary(data.summary)
        SubmissionFormPage.fillInSummaryCreator(data.creator)
        SubmissionFormPage.fillInSummaryDate(data.summaryDate)
        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
      })
      ManuscriptsPage.getStatus(0).should('eq', 'evaluated')
    })

    it('sort article after Article id', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInArticleld('456')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInArticleld('abc')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
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
      cy.task('seedForms')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
        cy.awaitDisappearSpinner()
        ManuscriptsPage.getTableHeader().should('be.visible')
        ManuscriptsPage.getEvaluationButton().should('not.exist')
        ManuscriptsPage.clickSubmit()

        NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()

        // fill the submit form and submit it
        // eslint-disable-next-line jest/valid-expect-in-promise
        cy.fixture('submission_form_data').then(data => {
          SubmissionFormPage.fillInArticleld(data.articleId)
          SubmissionFormPage.fillInArticleUrl(data.doi)
          SubmissionFormPage.fillInBioRxivArticleUrl(data.articleId)
          SubmissionFormPage.fillInDescription(data.description)
          SubmissionFormPage.fillInReview1(data.review1)
          SubmissionFormPage.fillInReview1Creator(data.creator)
          SubmissionFormPage.fillInReview1Date(data.review1Date)
          SubmissionFormPage.fillInReview2(data.review2)
          SubmissionFormPage.fillInReview2Creator(data.creator)
          SubmissionFormPage.fillInReview2Date(data.review2Date)
          SubmissionFormPage.fillInReview3(data.review3)
          SubmissionFormPage.fillInReview3Creator(data.creator)
          SubmissionFormPage.fillInReview3Date(data.review3Date)
          SubmissionFormPage.fillInSummary(data.summary)
          SubmissionFormPage.fillInSummaryCreator(data.creator)
          SubmissionFormPage.fillInSummaryDate(data.summaryDate)
          // eslint-disable-next-line
          SubmissionFormPage.waitThreeSec()
          SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
        })
      })
    })
    it('after submitting an article, user is redirect to Manuscripts page', () => {
      // asserts on the manuscripts page
      ManuscriptsPage.getManuscriptsPageTitle().should('be.visible')
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
      ManuscriptsPage.getControlButton().should('not.exist')
      ManuscriptsPage.getOptionWithText('Publish').should('not.exist')
    })
    it('evaluate article and check status is changed and Publish button is visible', () => {
      ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
      ManuscriptsPage.clickEvaluation()

      SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()

      ManuscriptsPage.getStatus(0).should('eq', 'evaluated')
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
      ManuscriptsPage.getOptionWithText('Publish').should('be.visible')
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
        SubmissionFormPage.getReview1()
          .find('p')
          .should('contain', data.review1)
        SubmissionFormPage.getReview1Creator().should(
          'have.value',
          data.creator,
        )
        SubmissionFormPage.getReview1Date().should(
          'have.value',
          data.review1Date,
        )
        SubmissionFormPage.getReview2()
          .find('p')
          .should('contain', data.review2)
        SubmissionFormPage.getReview2Creator().should(
          'have.value',
          data.creator,
        )
        SubmissionFormPage.getReview2Date().should(
          'have.value',
          data.review2Date,
        )
        SubmissionFormPage.getReview3()
          .find('p')
          .should('contain', data.review3)
        SubmissionFormPage.getReview3Creator().should(
          'have.value',
          data.creator,
        )
        SubmissionFormPage.getReview3Date().should(
          'have.value',
          data.review3Date,
        )
        SubmissionFormPage.getSummary()
          .find('p')
          .should('contain', data.summary)
        SubmissionFormPage.getSummaryCreator().should(
          'have.value',
          data.creator,
        )
        SubmissionFormPage.getSummaryDate().should(
          'have.value',
          data.summaryDate,
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
        SubmissionFormPage.fillInArticleUrl(
          'https://doi.org/10.1101/2020.12.22.423946',
        )
        SubmissionFormPage.fillInDescription('new description')
        SubmissionFormPage.fillInReview1('review 1 is completed')
        SubmissionFormPage.fillInReview1Creator('test.test')
        SubmissionFormPage.fillInReview1Date('10/03/2050')
        SubmissionFormPage.fillInReview2('review 2 is completed')
        SubmissionFormPage.fillInReview2Creator('test.test')
        SubmissionFormPage.fillInReview2Date('10/04/2050')
        SubmissionFormPage.fillInReview3('review 3 is completed')
        SubmissionFormPage.fillInReview3Creator('test.test')
        SubmissionFormPage.fillInReview3Date('10/03/2050')
        SubmissionFormPage.fillInSummary('review summay is completed')
        SubmissionFormPage.fillInSummaryCreator('test.test')
        SubmissionFormPage.fillInSummaryDate('10/03/2050')

        // eslint-disable-next-line
        SubmissionFormPage.waitThreeSec()
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
        SubmissionFormPage.getReview1()
          .find('p')
          .should('not.contain', data.review1)
        SubmissionFormPage.getReview1Creator().should(
          'not.have.value',
          data.creator,
        )
        SubmissionFormPage.getReview1Date().should(
          'not.have.value',
          data.review1Date,
        )
        SubmissionFormPage.getReview2()
          .find('p')
          .should('not.contain', data.review2)
        SubmissionFormPage.getReview2Creator().should(
          'not.have.value',
          data.creator,
        )
        SubmissionFormPage.getReview2Date().should(
          'not.have.value',
          data.review2Date,
        )
        SubmissionFormPage.getReview3()
          .find('p')
          .should('not.contain', data.review3)
        SubmissionFormPage.getReview3Creator().should(
          'not.have.value',
          data.creator,
        )
        SubmissionFormPage.getReview3Date().should(
          'not.have.value',
          data.review3Date,
        )
        SubmissionFormPage.getSummary()
          .find('p')
          .should('not.contain', data.summary)
        SubmissionFormPage.getSummaryCreator().should(
          'not.have.value',
          data.creator,
        )
        SubmissionFormPage.getSummaryDate().should(
          'not.have.value',
          data.summaryDate,
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
  context('DOI validation', () => {
    beforeEach(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')
      cy.task('seedForms')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHeader().should('be.visible')
    })
    it('message for DOI invalid is visible ', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInArticleUrl('google.com')
      SubmissionFormPage.fillInDescription('2')
      SubmissionFormPage.getValidationErrorMessage('DOI is invalid')
    })
  })
  context('video chat button', () => {
    beforeEach(() => {
  context('Evaluation and summary page tests', () => {
    // this method is use to avoid script errors
    // eslint-disable-next-line handle-callback-err
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    before(() => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initialState')
      cy.task('seedForms')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      ManuscriptsPage.getTableHeader().should('be.visible')
    })
    it('check the video chat link, and if it returns 200', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      // eslint-disable-next-line prettier/prettier
      ManuscriptsPage.getLiveChatButton().invoke('attr', 'href').should('contain', '//8x8.vc/coko/')
      ManuscriptsPage.getLiveChatButton()
        .then(link => {
        cy.request(link.prop('href')).its('status').should('eq', 200)
        cy.awaitDisappearSpinner()
        ManuscriptsPage.getTableHeader().should('be.visible')
        ManuscriptsPage.getEvaluationButton().should('not.exist')
        ManuscriptsPage.clickSubmit()

        NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()

        // fill the submit form and submit it
        // eslint-disable-next-line jest/valid-expect-in-promise
        cy.fixture('submission_form_data').then(data => {
          SubmissionFormPage.fillInArticleld(data.articleId)
          SubmissionFormPage.fillInArticleUrl(data.doi)
          SubmissionFormPage.fillInBioRxivArticleUrl(data.articleId)
          SubmissionFormPage.fillInDescription(data.description)
          SubmissionFormPage.fillInReview1(data.review1)
          SubmissionFormPage.fillInReview1Creator(data.creator)
          SubmissionFormPage.fillInReview1Date(data.review1Date)
          SubmissionFormPage.fillInReview2(data.review2)
          SubmissionFormPage.fillInReview2Creator(data.creator)
          SubmissionFormPage.fillInReview2Date(data.review2Date)
          SubmissionFormPage.fillInReview3(data.review3)
          SubmissionFormPage.fillInReview3Creator(data.creator)
          SubmissionFormPage.fillInReview3Date(data.review3Date)
          SubmissionFormPage.fillInSummary(data.summary)
          SubmissionFormPage.fillInSummaryCreator(data.creator)
          SubmissionFormPage.fillInSummaryDate(data.summaryDate)
          // eslint-disable-next-line
          SubmissionFormPage.waitThreeSec()
        })
      })
    })
    beforeEach(() => {
      cy.url().then(url => {
        const regex = /\/(([\w*\d-]){30,})\//
        const id = url.match(regex)[1]
        cy.wrap(id).as('manuscriptId')
      })
      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
        cy.awaitDisappearSpinner()
      })
    })
    it('check evaluation page for review 1', () => {
      cy.get('@manuscriptId').then(id => {
        const url = evaluationResultUrl(id, 1)
        cy.visit(url)
      })
      cy.awaitDisappearSpinner()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        ResultAndSummaryPage.getDescription().should(
          'contain',
          data.description,
        )
        ResultAndSummaryPage.getEvaluationType().should(
          'contain',
          data.peerReview,
        )
        ResultAndSummaryPage.getReview().should('contain', data.review1)
        ResultAndSummaryPage.getLinkTooriginalArticle().should('be.visible')
        ResultAndSummaryPage.getDate().should('contain', data.review1Date)
      })
    })
    it('check evaluation page for review 2', () => {
      cy.get('@manuscriptId').then(id => {
        const url = evaluationResultUrl(id, 2)
        cy.visit(url)
      })
      cy.awaitDisappearSpinner()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        ResultAndSummaryPage.getDescription().should(
          'contain',
          data.description,
        )
        ResultAndSummaryPage.getEvaluationType().should(
          'contain',
          data.peerReview,
        )
        ResultAndSummaryPage.getReview().should('contain', data.review2)
        ResultAndSummaryPage.getLinkTooriginalArticle().should('be.visible')
        ResultAndSummaryPage.getDate().should('contain', data.review2Date)
      })
    })
    it('check evaluation page for review 3', () => {
      cy.get('@manuscriptId').then(id => {
        const url = evaluationResultUrl(id, 3)
        cy.visit(url)
      })
      cy.awaitDisappearSpinner()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        ResultAndSummaryPage.getDescription().should(
          'contain',
          data.description,
        )
        ResultAndSummaryPage.getEvaluationType().should(
          'contain',
          data.peerReview,
        )
        ResultAndSummaryPage.getReview().should('contain', data.review3)
        ResultAndSummaryPage.getLinkTooriginalArticle().should('be.visible')
        ResultAndSummaryPage.getDate().should('contain', data.review3Date)
      })
    })
    it('check evaluation summary page', () => {
      cy.get('@manuscriptId').then(id => {
        const url = evaluationSummaryUrl(id)
        cy.visit(url)
      })
      cy.awaitDisappearSpinner()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        ResultAndSummaryPage.getDescription().should(
          'contain',
          data.description,
        )
        ResultAndSummaryPage.getEvaluationType().should(
          'contain',
          data.evaluationSummary,
        )
        ResultAndSummaryPage.getReview().should('contain', data.summary)
        ResultAndSummaryPage.getLinkTooriginalArticle().should('be.visible')
        ResultAndSummaryPage.getDate().should('contain', data.summaryDate)
      })
    })
  })
})

