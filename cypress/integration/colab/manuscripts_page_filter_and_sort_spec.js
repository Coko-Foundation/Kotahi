/* eslint-disable prettier/prettier */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable prettier/prettier */
/* eslint-disable jest/expect-expect */
import { dashboard } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('manuscripts page tests', () => {
  beforeEach(() => {
    // task to restore the database as per the dumps/initial_state_other.sql
    cy.task('restore', 'initial_state_other')
    cy.task('seedForms')

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
      // eslint-disable-next-line jest/valid-expect-in-promise
      SubmissionFormPage.clickLabelsDropdown()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.fillInTitle('123')
      Menu.clickDashboardAndVerifyPageLoaded()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.clickLabelsDropdown()
      SubmissionFormPage.selectDropdownOption(1)
      SubmissionFormPage.fillInTitle('abc')
      Menu.clickDashboardAndVerifyPageLoaded()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.clickLabelsDropdown()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.fillInTitle('def')
      Menu.clickManuscriptsAndAssertPageLoad()
    })
    it('filter article after label and url contain that label', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      ManuscriptsPage.clickArticleLabel(-1)
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'readyToEvaluate')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Ready to evaluate')
      ManuscriptsPage.getLabelRow(1).should('contain', 'Ready to evaluate')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickArticleLabel(2)
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
      cy.url().should('contain', 'evaluated')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Evaluated')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickArticleLabel(1)
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'readyToEvaluate')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Ready to evaluate')
      ManuscriptsPage.getLabelRow(1).should('contain', 'Ready to evaluate')
    })
    it('combined filtering after status and label, link content that combination', () => {
      Menu.clickDashboardAndVerifyPageLoaded()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoiColab(data.doi)
        SubmissionFormPage.getWaxInputBox(0).fillInput(data.abstract)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInLink(data.doi)
        SubmissionFormPage.getWaxInputBox(1).fillInput(data.ourTake)
        SubmissionFormPage.getWaxInputBox(2).fillInput(data.mainFindings)
        SubmissionFormPage.getWaxInputBox(3).fillInput(data.studyStrengths)
        SubmissionFormPage.getWaxInputBox(4).fillInput(data.limitations)
        SubmissionFormPage.fillInKeywords(data.keywords)
        SubmissionFormPage.fillInReviewCreator(data.creator)
        SubmissionFormPage.clickSubmitResearch()
        SubmissionFormPage.clickSubmitManuscriptAndWaitPageLoad()
      })
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getAllArticleCheckboxes().should('not.exist')

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      ManuscriptsPage.clickStatus(-1)
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getStatus(0).should('contain', 'Unsubmitted')
      cy.url().should('contain', 'new')
      ManuscriptsPage.clickArticleLabel(-1)
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'status=new&submission.labels=readyToEvaluate')
    })
  })
  context('select button from Label column', () => {
    beforeEach(() => {
      cy.task('restore', 'initial_state_other')
      cy.task('seedForms')
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
    it('after click on Select new status is displayed ', () => {
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 2)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
      ManuscriptsPage.clickSelect()
      ManuscriptsPage.getLabelRow(0).should('contain', 'Ready to evaluate')
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 1)
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
