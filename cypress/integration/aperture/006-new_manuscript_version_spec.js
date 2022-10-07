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
    cy.fixture('role_names').then(name => {
      // login as admin
      cy.login(name.role.admin.name, dashboard)
      DashboardPage.clickManuscriptNavButton()
      ManuscriptsPage.clickControlButton()
      ControlPage.getAssignSeniorEditorDropdown()
        .click({ force: true })
        .type(`${name.role.seniorEditor.username}{enter}`) // Assign Editor

       // Edditor  Submits a decision 
       cy.login(name.role.seniorEditor.name, dashboard)
       DashboardPage.clickControlPanel()
       ControlPage.getPublishButton().should('be.disabled') // Verify publish button is disabled
       // Fill the decision form
       ControlPage.clickDecisionTextInput()
       ControlPage.getDecisionTextInput().type(decisionTextContent)
       ControlPage.getDecisionFileInput().attachFile(decisionFileName)
       ControlPage.clickRevise()
       ControlPage.clickSubmitDecisionButton() // Submit the decision
       ControlPage.checkSvgExists() // Check appears in front of button

      // View Decision as an Author 
      cy.login(name.role.author.name, dashboard) // Login as an Author
      DashboardPage.getSubmittedManuscript().click() // Click on first MySubmission
      // Verify Decision Content
      DashboardPage.getDecisionField(0).should('contain', decisionTextContent)
      DashboardPage.getDecisionField(1).should('contain', decisionFileName)
      DashboardPage.getDecisionField(2).should('contain', 'revise')
      DashboardPage.clickCreateNewVersionButton() // Create new manuscript version
      SubmissionFormPage.getTypeOfResearchObject()
        .click()
        .type('Dataset{enter}')
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.clickSubmitYourManuscript()
      DashboardPage.getSubmittedManuscript()
        .contains('test pdf')
        .should('exist') // Verify new submission got created

      // Login as editor and check the new version submission form
      cy.login(name.role.seniorEditor.name, dashboard)
      DashboardPage.clickControlPanel()
      ControlPage.getPublishButton().should('be.disabled') // Verify publish button is disabled
    })
  })
})
