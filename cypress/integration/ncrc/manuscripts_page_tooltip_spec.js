/* eslint-disable prettier/prettier */
/* eslint-disable jest/expect-expect */

import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe('tooltip tests', () => {
  beforeEach(() => {
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

  })
  it('check tooltip text', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture("submission_form_data").then(data => {
      SubmissionFormPage.fillInAbstract(data.abstract)
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getTooltip().should('contain', data.abstract)
    })
  })

  it('check length for the tooltip text, to be less than 1000', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture("submission_form_data").then(data => {
      SubmissionFormPage.fillInAbstract(data.abstractWithMoreThan1000Characters)
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getTooltip().should('contain', "...").should('have.lengthOf.lessThan', 1004)
    })
  })

})