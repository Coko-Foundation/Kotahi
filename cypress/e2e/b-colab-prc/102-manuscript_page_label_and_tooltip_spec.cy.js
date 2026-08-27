/* eslint-disable promise/always-return */
/* eslint-disable cypress/no-unnecessary-waiting */

import { dashboard } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'

describe('Checking manuscripts page: label selection and tooltip', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.getHeader().should('be.visible')
    // submission of new manuscript
    cy.wait(2000)
    DashboardPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    Menu.clickManuscriptsAndAssertPageLoad()
  })

  it('verifies the selected label after choosing from the dropdown', () => {
    cy.contains('div', 'Manuscripts').should('exist')
    ManuscriptsPage.getArticleLabel().should('be.visible')

    // Function to select a label and verify it
    const selectLabelAndVerify = label => {
      ManuscriptsPage.clickArticleLabel(-1)
      cy.getByDataTestId('select-dropdown')
        .find('[data-testid="editable-option"]')
        .contains(label)
        .click({ force: true })
      ManuscriptsPage.getArticleLabel().eq(-1).should('contain', label)
      Menu.clickManuscriptsAndAssertPageLoad()
    }

    // Test different labels
    const labels = ['Ready to evaluate', 'Evaluated', 'Ready to publish']
    labels.forEach(selectLabelAndVerify)

    // Unset the custom label
    ManuscriptsPage.clickArticleLabelClear(-1)
    ManuscriptsPage.getArticleLabel()
      .eq(-1)
      .should('not.contain', 'Ready to publish')
  })

  context('tooltip tests', () => {
    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)
      })
      cy.awaitDisappearSpinner()
    })

    it('check no tooltip for empty abstract', () => {
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getTooltipText().should('not.exist')
      ManuscriptsPage.getTooltipIcon().should('be.visible').click()
      ManuscriptsPage.getTooltipText().should('contain', 'No abstract provided')
    })

    it('check tooltip text', () => {
      cy.contains('Continue Submission').click()
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInAbstractColab(data.abstract)
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.getTooltipText().should('not.exist')
        ManuscriptsPage.getTooltipIcon().should('be.visible').click()
        ManuscriptsPage.getTooltipText()
          .should('contain', data.abstract)
          .and('not.contain', '<p class="paragraph">')
      })
    })

    it('truncates a long abstract to 60 words', () => {
      const longAbstract = Array.from(
        { length: 65 },
        (_, i) => `word${i + 1}`,
      ).join(' ')

      cy.contains('Continue Submission').click()
      SubmissionFormPage.fillInAbstractColab(longAbstract)
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getTooltipText().should('not.exist')
      ManuscriptsPage.getTooltipIcon().click()
      ManuscriptsPage.getTooltipText()
        .should('contain', '...')
        .should($el => {
          expect($el.text().trim().split(/\s+/).length).to.be.at.most(61)
        })
    })
  })
})
