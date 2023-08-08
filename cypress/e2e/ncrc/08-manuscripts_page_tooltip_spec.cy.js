/* eslint-disable prettier/prettier */
/* eslint-disable jest/expect-expect */

import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe.skip('tooltip tests', () => {
  beforeEach(() => {
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
  })
  it('check empty tooltip', () => {
    Menu.clickManuscriptsAndAssertPageLoad()
    ManuscriptsPage.getTooltipText().should('not.exist')
    ManuscriptsPage.getTooltipIcon().should('be.visible').trigger('mouseover')
    ManuscriptsPage.getTooltipText().invoke('text').should('eq', '')
  })
  it('check tooltip text', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInAbstract(data.abstract)
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getTooltipText().should('not.exist')
      ManuscriptsPage.getTooltipIcon().should('be.visible').trigger('mouseover')
      ManuscriptsPage.getTooltipText()
        .should('contain', data.abstract)
        .and('not.contain', '<p class="paragraph">')
    })
  })

  it('check length for the tooltip text, to be less than 1000', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInAbstract(data.abstractWithMoreThan1000Characters)
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getTooltipText().should('not.exist')
      ManuscriptsPage.getTooltipIcon().trigger('mouseover')
      ManuscriptsPage.getTooltipText()
        .should('contain', '...')
        .should('have.lengthOf.lessThan', 1004)
    })
  })
})
