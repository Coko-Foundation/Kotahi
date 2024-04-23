import { dashboard } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('manuscripts page label selection tests', () => {
  beforeEach(() => {
    // task to restore the database as per the dumps/initial_state_other.sql
    cy.task('restore', 'commons/colab_bootstrap')
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.getHeader().should('be.visible')
  })

  context('article label Selection on Manuscripts Page', () => {
    beforeEach(() => {
      // submission of new manuscript
      DashboardPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      Menu.clickManuscriptsAndAssertPageLoad()
    })
    // eslint-disable-next-line jest/expect-expect
    it('verifies the selected label after choosing from the dropdown', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      // click on the select button
      cy.get('[class*=style__StyledButton]').click()
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      // Click on article label and select 'Ready to evaluate'
      ManuscriptsPage.clickArticleLabel(-1)
      cy.get('[class*=LabelDropdown__DropdownElement]')
        .contains('Ready to evaluate')
        .click()
      ManuscriptsPage.getLabelDropdown().should('contain', 'Ready to evaluate')
      Menu.clickManuscriptsAndAssertPageLoad()

      // Click on article label and select 'Evaluated'
      cy.get('[class*=LabelDropdown__DropdownElement]').click()
      cy.get('[class*=LabelDropdown__DropdownMenu]')
        .contains('Evaluated')
        .click()
      ManuscriptsPage.getLabelDropdown().should('contain', 'Evaluated')
      Menu.clickManuscriptsAndAssertPageLoad()

      // Click on article label and select 'Ready to publish'
      cy.get('[class*=LabelDropdown__DropdownElement]').click()
      cy.get('[class*=LabelDropdown__DropdownMenu]')
        .contains('Ready to publish')
        .click()
      ManuscriptsPage.getLabelDropdown().should('contain', 'Ready to publish')

      Menu.clickManuscriptsAndAssertPageLoad()

      // Unset the custom label
      cy.get('[class*=LabelDropdown__StyledButton]').eq(0).click()
      cy.get('[class*=style__StyledButton]').should('contain', 'Select')
    })
  })
})
