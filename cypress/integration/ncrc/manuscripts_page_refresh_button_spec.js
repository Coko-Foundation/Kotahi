/* eslint-disable jest/valid-expect-in-promise,jest/valid-expect */
import {
  manuscripts,
  manuscriptStatus,
  unsubmitted,
  submitted,
  evaluated,
  published,
} from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe('refresh button tests', () => {
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
  })

  it('check button exists and is visible', () => {
    ManuscriptsPage.getRefreshButton().should('exist').and('be.visible')
  })

  context('functionality check', () => {
    beforeEach(() => {
      ManuscriptsPage.clickRefreshButton()
      // wait for data to be imported
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(15000)
      cy.reload()
      cy.awaitDisappearSpinner()
    })
    it('check table has data', () => {
      ManuscriptsPage.getNumberOfAvailableArticles()
        .invoke('text')
        .then(text => {
          expect(parseInt(text, 10)).to.be.gt(0)
        })
    })
    it('check only unsubmitted articles are available', () => {
      ManuscriptsPage.getNumberOfAvailableArticles()
        .invoke('text')
        .then(allArticlesCount => {
          const importedArticlesCount = parseInt(allArticlesCount, 10)
          expect(importedArticlesCount).to.be.gt(0)
          cy.visit(manuscriptStatus + unsubmitted)
          ManuscriptsPage.getNumberOfAvailableArticles()
            .invoke('text')
            .then(unsubmittedCount => {
              expect(parseInt(unsubmittedCount, 10)).to.be.eq(
                importedArticlesCount,
              )
            })
          cy.visit(manuscriptStatus + submitted)
          ManuscriptsPage.getNumberOfAvailableArticles()
            .invoke('text')
            .then(submittedCount => {
              expect(parseInt(submittedCount, 10)).to.be.eq(0)
            })
          cy.visit(manuscriptStatus + evaluated)
          ManuscriptsPage.getNumberOfAvailableArticles()
            .invoke('text')
            .then(evaluatedCount => {
              expect(parseInt(evaluatedCount, 10)).to.be.eq(0)
            })
          cy.visit(manuscriptStatus + published)
          ManuscriptsPage.getNumberOfAvailableArticles()
            .invoke('text')
            .then(publishedCount => {
              expect(parseInt(publishedCount, 10)).to.be.eq(0)
            })
        })
    })
    it('import date range should be last 2 weeks', () => {
      const date = new Date()

      const today = new Date(
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      )

      const twoWeeksAgo = new Date(today - 12096e5)
      // checking the oldest article imported
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      SubmissionFormPage.getDatePublishedField()
        .should('have.attr', 'value')
        .then(value => {
          const datePublished = new Date(value)
          expect(datePublished).to.be.gte(twoWeeksAgo)
          expect(datePublished).to.be.lte(today)
        })
      // checking the latest article imported
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickPaginationButton(-1)
      cy.awaitDisappearSpinner()
      ManuscriptsPage.clickEvaluationNthAndVerifyUrl(-1)
      SubmissionFormPage.getDatePublishedField()
        .should('have.attr', 'value')
        .then(value => {
          const datePublished = new Date(value)
          expect(datePublished).to.be.gte(twoWeeksAgo)
          expect(datePublished).to.be.lte(today)
        })
    })
    it('at least one topic should exist per imported article', () => {
      ManuscriptsPage.getTableRowsCount().then(length => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < length; i++) {
          ManuscriptsPage.getStatus(i).should('be.eq', 'Unsubmitted')
          ManuscriptsPage.getArticleTopicByRow(i)
            .its('length')
            .should('be.gte', 1)
        }
      })
    })
  })
})
