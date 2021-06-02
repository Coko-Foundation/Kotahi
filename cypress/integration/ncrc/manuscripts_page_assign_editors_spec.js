/* eslint-disable jest/expect-expect */

import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe('manuscripts page assign editors tests', () => {
  beforeEach(() => {
  before(() => {
    cy.task('restore', 'initialState')
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
  })

  it('assign editors dropdown are visible, and are selected editors', () => {
    ManuscriptsPage.clickEvaluation()
    cy.url().should('contain', 'evaluation')
    cy.awaitDisappearSpinner()
  it('assign editors dropdown are visible, and are selected editors', () => {
    ManuscriptsPage.clickEvaluation()
    cy.url().should('contain', 'evaluation')
    SubmissionFormPage.waitThreeSec()
    SubmissionFormPage.getAssigEditor(0).should(
      'contain',
      'Assign Senior Editor…',
    )
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      SubmissionFormPage.getAssigEditor(0).click()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.waitThreeSec()
      SubmissionFormPage.getAssigEditor(0).should(
        'contain',
        name.role.reviewers.reviewer3,
      )
      SubmissionFormPage.getAssigEditor(1).should(
        'contain',
        'Assign Handling Editor…',
      )
      SubmissionFormPage.getAssigEditor(1).click()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.waitThreeSec()
      SubmissionFormPage.getAssigEditor(1).should(
        'contain',
        name.role.reviewers.reviewer3,
      )
    })
  })

  it('check editor name appears in table', () => {
    ManuscriptsPage.clickEvaluation()
    cy.awaitDisappearSpinner()
    SubmissionFormPage.getAssigEditor(0).click()
    SubmissionFormPage.selectDropdownOption(0)
    Menu.clickManuscriptsAndAssertPageLoad()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .should('contain', name.role.reviewers.reviewer3)
    })
    ManuscriptsPage.clickEvaluation()
    cy.awaitDisappearSpinner()
    SubmissionFormPage.getAssigEditor(1).click()
    SubmissionFormPage.selectDropdownOption(3)
    Menu.clickManuscriptsAndAssertPageLoad()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .should('contain', name.role.reviewers.reviewer1)
    })
    SubmissionFormPage.getAssigEditor(0).click()
    SubmissionFormPage.selectDropdownOption(0)
    SubmissionFormPage.waitThreeSec()
    SubmissionFormPage.getAssigEditor(0).should('contain', 'Elaine Barnes')
    SubmissionFormPage.getAssigEditor(1).should(
      'contain',
      'Assign Handling Editor…',
    )
    SubmissionFormPage.getAssigEditor(1).click()
    SubmissionFormPage.selectDropdownOption(0)
    SubmissionFormPage.waitThreeSec()
    SubmissionFormPage.getAssigEditor(1).should('contain', 'Elaine Barnes')
  })
})
