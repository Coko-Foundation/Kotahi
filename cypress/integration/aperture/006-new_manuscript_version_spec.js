/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes'

const decisionTextContent = 'Please fix Foo in the Paper!'
const decisionFileName = 'test-pdf.pdf'

describe('checking manuscript version', () => {
  it('editor checks for new manuscript version', () => {
    cy.task('restore', 'commons/bootstrap')
    cy.task('seed', 'three_reviews_completed')
    cy.task('seedForms')

    return cy.fixture('role_names').then(name => {
      /* login as admin */
      cy.login(name.role.admin.name, dashboard)
      DashboardPage.clickManuscriptNavButton()
      ManuscriptsPage.clickControlButton()
      /* Assign Editor */
      ControlPage.getAssignSeniorEditorDropdown()
        .click({ force: true })
        .type(`${name.role.seniorEditor.username}{enter}`)

      /* Editor  Submits a decision */
      cy.login(name.role.seniorEditor.name, dashboard)
      DashboardPage.clickControlPanel()
      /* Verify publish button is disabled */
      ControlPage.getPublishButton().should('be.disabled')
      /* Fill the decision form */
      ControlPage.clickDecisionTextInput()
      ControlPage.getDecisionTextInput().type(decisionTextContent)
      ControlPage.getDecisionFileInput().attachFile(decisionFileName)
      ControlPage.clickRevise()
      /* Submit the decision */
      ControlPage.clickSubmitDecisionButton()
      /* Check appears in front of button */
      ControlPage.checkSvgExists()

      /* View Decision as an Author */
      cy.login(name.role.author.name, dashboard)
      /* Click on first MySubmission */
      DashboardPage.getSubmittedManuscript().click()
      // Verify Decision Content
      DashboardPage.getDecisionField(0).should('contain', decisionTextContent)
      DashboardPage.getDecisionField(1).should('contain', decisionFileName)
      DashboardPage.getDecisionField(2).should('contain', 'revise')
      /* Create new manuscript version */
      DashboardPage.clickCreateNewVersionButton()
      SubmissionFormPage.getTypeOfResearchObject()
        .click()
        .type('Dataset{enter}')
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.clickSubmitYourManuscript()
      /* Verify new submission got created */
      DashboardPage.getSubmittedManuscript()
        .contains('test pdf')
        .should('exist')

      /* Login as editor and check the new version submission form */
      cy.login(name.role.seniorEditor.name, dashboard)
      DashboardPage.clickControlPanel()
      /* Verify publish button is disabled */
      ControlPage.getPublishButton().should('be.disabled')
    })
  })
})
