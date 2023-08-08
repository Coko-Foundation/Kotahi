/* eslint-disable prettier/prettier */
/* eslint-disable jest/expect-expect */
import { dashboard, manuscripts } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('manuscripts page checkboxes tests', () => {
  context('unsubmitted manuscripts checkbox tests', () => {
    before(() => {
      cy.task('restore', 'commons/colab_bootstrap')
      // cy.task('seedForms')
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
      Menu.clickDashboardAndVerifyPageLoaded()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInTitle('def')
      Menu.clickManuscriptsAndAssertPageLoad()
    })
    beforeEach(() => {
      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
    })
    it('checkbox visibility', () => {
      ManuscriptsPage.getSelectAllCheckbox().should('be.visible')
      ManuscriptsPage.getAllArticleCheckboxesLength().should('eq', 3)
    })
    it('select an article & check selection', () => {
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
      ManuscriptsPage.clickArticleCheckbox(1)
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 1)
    })
    it('select & deselect all articles and check count', () => {
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 3)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
    })
    it('click Close to not Archive the articles', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 4)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.clickClose()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 3)
    })
    it('archive selected article', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 4)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.getConfirmationMessageForBulkDelete().should(
        'contain',
        'Please confirm you would like to archive selected manuscripts',
      )
      ManuscriptsPage.clickConfirm()
      ManuscriptsPage.getConfirmationMessageForBulkDelete().should('not.exist')
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
    })
  })
  context('submitted manuscripts checkbox tests', () => {
    it('checkbox should not be visible for submitted manuscripts', () => {
      cy.task('restore', 'commons/colab_bootstrap')
      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)
      })
      cy.awaitDisappearSpinner()
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoiColab(data.doi)
        SubmissionFormPage.getWaxInputBox(0).fillInput(data.abstract)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInLink(data.doi)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInKeywords(data.keywords)
        SubmissionFormPage.clickLabelsDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInReviewCreator(data.creator)
        SubmissionFormPage.clickSubmitResearch()
        SubmissionFormPage.clickSubmitManuscriptAndWaitPageLoad()
      })
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getAllArticleCheckboxes().should('not.exist')
    })
  })
})
