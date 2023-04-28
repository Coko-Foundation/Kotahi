/* eslint-disable jest/expect-expect */

import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe('manuscripts page checkboxes tests', () => {
  context('unsubmitted manuscripts checkbox tests', () => {
    before(() => {
      cy.task('restore', 'initial_state_other')
      cy.task('seedForms')
      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInArticleDescription('123')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInArticleDescription('abc')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInArticleDescription('def')
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
    it('click Close to not delete the articles', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.clickClose()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 3)
    })
    it('delete selected article', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.getConfirmationMessageForBulkDelete().should(
        'contain',
        'Please confirm you would like to delete selected articles',
      )
      ManuscriptsPage.clickConfirm()
      ManuscriptsPage.getTableRow().should('not.exist')
    })
  })
  context('submitted manuscripts checkbox tests', () => {
    it('checkbox should not be visible for submitted manuscripts', () => {
      cy.task('restore', 'initial_state_other')
      cy.task('seedForms')
      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleUrl(data.doi)
        SubmissionFormPage.fillInArticleDescription(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickStudyDesignDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickLabelsDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInJournal(data.journal)
        SubmissionFormPage.fillInReviewer(data.creator)
        SubmissionFormPage.fillInReviewCreator(data.creator)
        // eslint-disable-next-line
        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
      })
      ManuscriptsPage.getAllArticleCheckboxes().should('not.exist')
    })
  })
})
