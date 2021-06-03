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
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture("submission_form_data").then(date => {
      SubmissionFormPage.fillInAbstract(date.abstract)
    })
    Menu.clickManuscriptsAndAssertPageLoad()
  })

  it('check tooltip text and length to be less than 1000', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture("submission_form_data").then(data => {
      ManuscriptsPage.getTooltip().should('contain', data.abstract)
      ManuscriptsPage.getTooltip().should('have.length.lessThan', 1000)
    })
  })

})