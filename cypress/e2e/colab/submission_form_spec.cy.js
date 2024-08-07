/* eslint-disable jest/expect-expect */
import { dashboard } from '../../support/routes1'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('manuscripts page tests', () => {
  beforeEach(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)

    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
  })

  it('word count button should be visible & display info', () => {
    SubmissionFormPage.getWordCountInfo().its('length').should('eq', 5)

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 5; i++) {
      SubmissionFormPage.getWordCountInfo()
        .eq(i)
        .scrollIntoView()
        .should('be.visible')
    }

    cy.getByClass('ProseMirror').eq(0).type('word count test{selectAll}')

    SubmissionFormPage.getWordCountInfo()
      .eq(0)
      .should('contain', '3')
      .and('contain', 'Words')
  })

  it("edit date should reflect today's date", () => {
    SubmissionFormPage.checkEditDateIsUpdated()
  })
})
