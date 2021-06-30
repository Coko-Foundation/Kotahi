/* eslint-disable jest/expect-expect */

import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe('manuscripts page assign editors tests', () => {
  beforeEach(() => {
    cy.task('restore', 'initial_state_ncrc')
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
    SubmissionFormPage.waitThreeSec()
    Menu.clickManuscriptsAndAssertPageLoad()
  })

  it('assign editors dropdown are visible, and are selected editors', () => {
    ManuscriptsPage.clickEvaluation()
    cy.url().should('contain', 'evaluation')
    cy.awaitDisappearSpinner()
    SubmissionFormPage.getAssignEditor(0).should(
      'contain',
      'Assign Senior Editor…',
    )
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      SubmissionFormPage.getAssignEditor(0).click()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.waitThreeSec()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        name.role.reviewers.reviewer3,
      )
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        'Assign Handling Editor…',
      )
      SubmissionFormPage.getAssignEditor(1).click()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.waitThreeSec()
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        name.role.reviewers.reviewer3,
      )
    })
  })

  it('check all three editor names appears in the table', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      cy.awaitDisappearSpinner()
      SubmissionFormPage.getAssignEditor(0).click()
      SubmissionFormPage.selectDropdownOptionWithText(
        name.role.reviewers.reviewer1,
      )
      SubmissionFormPage.getAssignEditor(1).click()
      SubmissionFormPage.selectDropdownOptionWithText(
        name.role.reviewers.reviewer2,
      )
      SubmissionFormPage.getAssignEditor(2).click()
      SubmissionFormPage.selectDropdownOptionWithText(
        name.role.reviewers.reviewer3,
      )
      Menu.clickManuscriptsAndAssertPageLoad()
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getEditorName()
        .eq(-3)
        .scrollIntoView()
        .should('contain', name.role.reviewers.reviewer1)
      ManuscriptsPage.getEditorName()
        .eq(-2)
        .scrollIntoView()
        .should('contain', name.role.reviewers.reviewer2)
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .scrollIntoView()
        .should('contain', name.role.reviewers.reviewer3)
    })
  })
  it('assign senior editor only', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      cy.awaitDisappearSpinner()
      SubmissionFormPage.getAssignEditor(0).click()
      SubmissionFormPage.selectDropdownOptionWithText(
        name.role.reviewers.reviewer3,
      )
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .scrollIntoView()
        .should('contain', name.role.reviewers.reviewer3)
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        name.role.reviewers.reviewer3,
      )
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        'Assign Handling Editor…',
      )
      SubmissionFormPage.getAssignEditor(2).should('contain', 'Assign Editor…')
    })
  })
  it('assign first handling editor only', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      cy.awaitDisappearSpinner()
      SubmissionFormPage.getAssignEditor(1).click()
      SubmissionFormPage.selectDropdownOptionWithText(
        name.role.reviewers.reviewer1,
      )
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .scrollIntoView()
        .should('contain', name.role.reviewers.reviewer1)
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        'Assign Senior Editor…',
      )
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        name.role.reviewers.reviewer1,
      )
      SubmissionFormPage.getAssignEditor(2).should('contain', 'Assign Editor…')
    })
  })
  it('assign second handling editor only', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      cy.awaitDisappearSpinner()
      SubmissionFormPage.getAssignEditor(2).click()
      SubmissionFormPage.selectDropdownOptionWithText(
        name.role.reviewers.reviewer1,
      )
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .scrollIntoView()
        .should('contain', name.role.reviewers.reviewer1)
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        'Assign Senior Editor…',
      )
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        'Assign Handling Editor…',
      )
      SubmissionFormPage.getAssignEditor(2).should(
        'contain',
        name.role.reviewers.reviewer1,
      )
    })
  })
  // to be implemented in #489
  // eslint-disable-next-line jest/no-commented-out-tests
  // it('editor should see article title in dashboard', () => {
  //   ManuscriptsPage.clickEvaluation()
  //   cy.url().should('contain', 'evaluation')
  //   cy.awaitDisappearSpinner()
  //   // eslint-disable-next-line jest/valid-expect-in-promise
  //   cy.fixture('role_names').then(name => {
  //     SubmissionFormPage.getAssignEditor(0).click()
  //     SubmissionFormPage.selectDropdownOption(0)
  //     SubmissionFormPage.waitThreeSec()
  //     SubmissionFormPage.getAssignEditor(0).should(
  //       'contain',
  //       name.role.reviewers.reviewer3,
  //     )
  //     cy.login(name.role.reviewers.reviewer3, dashboard)
  //     DashboardPage.getVersionTitle().should('contain', '123')
  //   })
  // })
})
