/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { dashboard } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('manuscripts page tests', () => {
  beforeEach(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)

    // cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.getHeader().should('be.visible')
  })

  context('filter and sort articles', () => {
    beforeEach(() => {
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      NewSubmissionPage.setCustomStatusField('Ready to evaluate')
      SubmissionFormPage.fillInTitle('123')
      Menu.clickDashboardAndVerifyPageLoaded()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      NewSubmissionPage.setCustomStatusField('Evaluated')
      SubmissionFormPage.fillInTitle('abc')
      Menu.clickDashboardAndVerifyPageLoaded()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      NewSubmissionPage.setCustomStatusField('Ready to evaluate')
      SubmissionFormPage.fillInTitle('def')
      Menu.clickManuscriptsAndAssertPageLoad()
    })
    it('filter article after label and url contain that label', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      ManuscriptsPage.selectCustomStatus('Ready to evaluate')
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      cy.url().should('contain', 'readyToEvaluate')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Ready to evaluate')
      ManuscriptsPage.getLabelRow(1).should('contain', 'Ready to evaluate')
      ManuscriptsPage.getLabelRow(2).should('contain', 'Ready to evaluate')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.selectCustomStatus('Evaluated')
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'evaluated')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Evaluated')
      ManuscriptsPage.getLabelRow(1).should('contain', 'Evaluated')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.selectCustomStatus('Ready to publish')
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
      cy.url().should('contain', 'readyToPublish')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Ready to publish')
    })
    it('combined filtering after status, link content that combination', () => {
      Menu.clickDashboardAndVerifyPageLoaded()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.getWaxField(0).fillInput(data.abstract)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInPreprintUri(data.doi)
        SubmissionFormPage.getWaxField(1).fillInput(data.ourTake)
        SubmissionFormPage.getWaxField(2).fillInput(data.mainFindings)
        SubmissionFormPage.getWaxField(3).fillInput(data.studyStrengths)
        SubmissionFormPage.getWaxField(4).fillInput(data.limitations)
        SubmissionFormPage.fillInKeywords(data.keywords)
        SubmissionFormPage.fillInReviewCreator(data.creator)
        SubmissionFormPage.clickSubmitResearch()
        SubmissionFormPage.clickSubmitManuscriptAndWaitPageLoad()
      })
      Menu.clickManuscriptsAndAssertPageLoad()
      // ManuscriptsPage.getAllArticleCheckboxes().should('not.exist') // It was written to confirm, if checkboxes are present across only submitted manuscripts, while after download to json update, we need checkbox across all of them

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      ManuscriptsPage.clickStatus(-1)
      ManuscriptsPage.getTableRowsCount().should('eq', 4)
      ManuscriptsPage.getStatus(0).should('contain', 'Unsubmitted')
      cy.url().should('contain', 'new')
    })
  })
  context('select button from Label column', () => {
    beforeEach(() => {
      const restoreUrl = Cypress.config('restoreUrl')
      cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)
      })
      cy.awaitDisappearSpinner()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInTitle('123')
      Menu.clickDashboardAndVerifyPageLoaded()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInTitle('abc')
      Menu.clickManuscriptsAndAssertPageLoad()
    })
    it('select button is visible', () => {
      ManuscriptsPage.getSelectButton().should('be.visible')
      // ManuscriptsPage.getLabelRow(1).should('not.exist') // line needs update to check that the only label visible is select.
    })
    it('after click on Select new status is displayed', () => {
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 2)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
      ManuscriptsPage.clickSelect()
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      ManuscriptsPage.getLabelRow(1).should('contain', 'Ready to evaluate')
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 2)
    })
    it('check label field after bulk delete', () => {
      ManuscriptsPage.clickArticleCheckbox(1)
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.clickConfirm()
      ManuscriptsPage.getNumberOfAvailableArticles().should('contain', 1)
      ManuscriptsPage.getArticleLabel().should('contain', 'Select')
    })
  })
})
